/**
 * POST /api/webhook-booking
 *
 * Cal.com webhook handler.
 * Triggered when a booking is confirmed (payment collected).
 * Sends intake documents for e-signature via configured provider.
 *
 * Cal.com webhook setup:
 *   1. Go to Cal.com → Settings → Developer → Webhooks
 *   2. Add webhook URL: https://your-domain.vercel.app/api/webhook-booking
 *   3. Event trigger: BOOKING_CREATED
 *   4. Add a secret for signature verification
 *
 * ENV vars:
 *   CALCOM_WEBHOOK_SECRET  = webhook signing secret from Cal.com
 *   SITE_URL               = https://your-domain.vercel.app
 *   ESIGN_PROVIDER         = "openapi" | "docusign" | "none" (default: "none")
 *   (plus provider-specific vars — see esign-provider.js)
 *
 * Feature flags:
 *   ESIGN_PROVIDER=none     → e-signing disabled, webhook logs booking only
 *   ESIGN_PROVIDER=openapi  → OpenAPI EU-SES (pending data residency confirmation)
 *   ESIGN_PROVIDER=docusign → DocuSign (inactive — $600/yr Developer plan required)
 */

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendForSignature } = require('./esign-provider');

// ─── SMTP Email Sending (all-inkl) ─────────────────────────

/**
 * Send signing URL to client via SMTP (all-inkl / nodemailer).
 * OpenAPI EU-SES does NOT send invitation emails — we must deliver the signing link ourselves.
 *
 * ENV vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Optional: SMTP_FROM_NAME (defaults to "Praxis Robert Rozek")
 */
async function sendSigningEmail({ email, name, signingUrl, lang }) {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const fromName = process.env.SMTP_FROM_NAME || 'Praxis Robert Rozek';

  if (!host || !user || !pass) {
    console.warn('[SMTP] Credentials not configured — skipping signing email');
    return false;
  }

  const isDE = lang === 'de';
  const subject = isDE
    ? 'Ihre Aufnahmedokumente — bitte unterschreiben'
    : 'Your intake documents — please sign';

  const htmlBody = isDE
    ? `<div style="font-family: Georgia, serif; color: #1c1917; max-width: 600px;">
        <p>Liebe/r ${name},</p>
        <p>vielen Dank für Ihre Buchung. Vor unserer ersten Sitzung bitte ich Sie, die Aufnahmedokumente zu lesen und elektronisch zu unterschreiben.</p>
        <p style="margin: 24px 0;">
          <a href="${signingUrl}" style="background-color: #b8976a; color: #1c1917; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">Dokumente unterschreiben</a>
        </p>
        <p>Der Link führt Sie zu einer sicheren Signaturplattform. Sie werden gebeten, sich per E-Mail-Code (OTP) zu authentifizieren.</p>
        <p>Bei Fragen stehe ich Ihnen gerne zur Verfügung.</p>
        <p>Mit freundlichen Grüßen,<br>Robert Rozek</p>
        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;">
        <p style="font-size: 12px; color: #a8a29e;">Praxis Robert Rozek · Augsburgerstraße 6 · 80337 München<br>
        <a href="https://robertrozek.de" style="color: #b8976a;">robertrozek.de</a></p>
      </div>`
    : `<div style="font-family: Georgia, serif; color: #1c1917; max-width: 600px;">
        <p>Dear ${name},</p>
        <p>Thank you for your booking. Before our first session, please review and electronically sign the intake documents.</p>
        <p style="margin: 24px 0;">
          <a href="${signingUrl}" style="background-color: #b8976a; color: #1c1917; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px;">Sign documents</a>
        </p>
        <p>The link will take you to a secure signing platform. You will be asked to authenticate via an email code (OTP).</p>
        <p>If you have any questions, please don't hesitate to reach out.</p>
        <p>Kind regards,<br>Robert Rozek</p>
        <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;">
        <p style="font-size: 12px; color: #a8a29e;">Praxis Robert Rozek · Augsburgerstraße 6 · 80337 München<br>
        <a href="https://robertrozek.de" style="color: #b8976a;">robertrozek.de</a></p>
      </div>`;

  const textBody = isDE
    ? `Liebe/r ${name},\n\nvielen Dank für Ihre Buchung. Bitte unterschreiben Sie die Aufnahmedokumente unter folgendem Link:\n\n${signingUrl}\n\nMit freundlichen Grüßen,\nRobert Rozek\nPraxis Robert Rozek · Augsburgerstraße 6 · 80337 München`
    : `Dear ${name},\n\nThank you for your booking. Please sign the intake documents at the following link:\n\n${signingUrl}\n\nKind regards,\nRobert Rozek\nPraxis Robert Rozek · Augsburgerstraße 6 · 80337 München`;

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: `"${name}" <${email}>`,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log(`[SMTP] Signing email sent to ${email}`);
    return true;
  } catch (err) {
    console.error(`[SMTP] Send failed: ${err.message}`);
    return false;
  }
}

function verifyCalcomSignature(payload, signature, secret) {
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  // Cal.com may send signature as-is or prefixed with "sha256="
  const sig = signature.replace(/^sha256=/, '');
  // Guard against length mismatch before timingSafeEqual
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expected)
  );
}

/**
 * Detect language from Cal.com booking data.
 * Heuristic: check timezone, locale, or location fields.
 */
function detectLanguage(booking) {
  const tz = String(booking.attendees?.[0]?.timeZone || '');
  const langField = booking.attendees?.[0]?.language;
  const localeField = booking.attendees?.[0]?.locale;

  // language/locale can be a string or an object — normalize to string
  const locale = typeof langField === 'string' ? langField
    : typeof localeField === 'string' ? localeField
    : typeof langField?.locale === 'string' ? langField.locale
    : '';

  // German-speaking regions
  if (locale.startsWith('de')) return 'de';
  if (/europe\/(berlin|vienna|zurich)/i.test(tz)) return 'de';

  return 'en';
}

module.exports = async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const signature = req.headers['x-cal-signature-256'] || req.headers['x-calcom-signature'];

  if (process.env.CALCOM_WEBHOOK_SECRET) {
    if (!verifyCalcomSignature(rawBody, signature, process.env.CALCOM_WEBHOOK_SECRET)) {
      console.error('Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload.triggerEvent || payload.event;

    // Only process confirmed bookings
    if (event !== 'BOOKING_CREATED') {
      return res.status(200).json({ ignored: true, event });
    }

    const booking = payload.payload || payload;
    const attendee = booking.attendees?.[0];

    if (!attendee?.email || !attendee?.name) {
      console.error('Missing attendee data', booking);
      return res.status(400).json({ error: 'Missing attendee email or name' });
    }

    const lang = detectLanguage(booking);
    const siteUrl = process.env.SITE_URL || 'https://robertrozek.de';
    const provider = process.env.ESIGN_PROVIDER || 'none';

    // Feature flag: if e-signing is disabled, just log the booking
    if (provider === 'none') {
      console.log(`Booking received: ${attendee.name} <${attendee.email}> [${lang}] — e-signing disabled, send intake docs manually`);
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: 'esign_disabled',
        attendee: { name: attendee.name, email: attendee.email, lang },
      });
    }

    // NOTE: hasAlreadySigned is disabled — GET /signatures only works for QES, not EU-SES (returns 404).
    // For now, every booking sends a new signing request. Signing twice is harmless.
    // TODO: Re-enable if OpenAPI adds EU-SES to GET /signatures, or track locally.

    console.log(`[Webhook] Booking: ${attendee.name} <${attendee.email}> [${lang}] — sending ${provider} e-sign request`);

    const result = await sendForSignature({
      name: attendee.name,
      email: attendee.email,
      phone: attendee.phone || undefined,
      lang,
      siteUrl,
    });

    console.log(`[Webhook] E-sign sent via ${result.provider}: ${result.requestId}`);
    console.log(`[Webhook] Signing URL: ${result.signingUrl}`);
    console.log(`[Webhook] Status: ${result.status}`);

    // Send signing URL to client via SMTP (all-inkl)
    if (result.signingUrl) {
      await sendSigningEmail({
        email: attendee.email,
        name: attendee.name,
        signingUrl: result.signingUrl,
        lang,
      });
    } else {
      console.warn('[Webhook] No signing URL returned — client will not receive signing email');
    }

    return res.status(200).json({
      success: true,
      provider: result.provider,
      requestId: result.requestId,
      signingUrl: result.signingUrl,
      status: result.status,
    });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }
};

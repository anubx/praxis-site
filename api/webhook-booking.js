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
const { sendForSignature, hasAlreadySigned } = require('./esign-provider');

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
    const siteUrl = process.env.SITE_URL || 'https://praxis-site-vert.vercel.app';
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

    // Check if this client has already signed intake documents
    const alreadySigned = await hasAlreadySigned(attendee.email);

    if (alreadySigned) {
      console.log(`Client already signed — skipping e-sign request`);
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: 'already_signed',
      });
    }

    const result = await sendForSignature({
      name: attendee.name,
      email: attendee.email,
      phone: attendee.phone || undefined,
      lang,
      siteUrl,
    });

    console.log(`E-sign sent via ${result.provider}: ${result.requestId}`);

    return res.status(200).json({
      success: true,
      provider: result.provider,
      requestId: result.requestId,
      status: result.status,
    });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: err.message });
  }
};

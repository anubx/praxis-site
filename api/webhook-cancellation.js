/**
 * POST /api/webhook-cancellation
 *
 * Cal.com webhook handler for BOOKING_CANCELLED events.
 * Automatically refunds Stripe payment if cancelled 24+ hours before session.
 *
 * Cal.com webhook setup:
 *   1. Go to Cal.com → Settings → Developer → Webhooks
 *   2. Add webhook URL: https://robertrozek.de/api/webhook-cancellation
 *   3. Event trigger: BOOKING_CANCELLED
 *   4. Use the same secret as the booking webhook
 *
 * ENV vars:
 *   CALCOM_WEBHOOK_SECRET  = same webhook signing secret from Cal.com
 *   STRIPE_SECRET_KEY      = Stripe secret key (sk_live_...)
 *   SESSION_PRICE_CENTS    = session price in cents (default: 15000 = €150)
 *
 * Refund policy:
 *   - Cancelled 24+ hours before session → full automatic refund
 *   - Cancelled <24 hours before session → no refund (logged, manual override possible)
 */

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ─── SMTP Email helpers ─────────────────────────────────────

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user || !pass) return null;
  return nodemailer.createTransport({
    host, port, secure: port === 465, auth: { user, pass },
  });
}

/**
 * Send refund confirmation or late-cancellation notice to the client.
 * Uses the same SMTP config as the signing email (all-inkl).
 */
async function sendCancellationEmail({ email, name, lang, refunded, amount, sessionDate }) {
  const transporter = getTransporter();
  if (!transporter) {
    console.warn('[SMTP] Credentials not configured — skipping cancellation email');
    return false;
  }

  const user = process.env.SMTP_USER;
  const fromName = process.env.SMTP_FROM_NAME || 'Praxis Robert Rozek';
  const isDE = lang === 'de';
  const dateStr = new Date(sessionDate).toLocaleDateString(isDE ? 'de-DE' : 'en-GB', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Berlin',
  });

  let subject, htmlBody, textBody;

  if (refunded) {
    subject = isDE
      ? 'Stornierung bestätigt — Rückerstattung wird bearbeitet'
      : 'Cancellation confirmed — refund is being processed';

    htmlBody = isDE
      ? `<div style="font-family: Georgia, serif; color: #1c1917; max-width: 600px;">
          <p>Liebe/r ${name},</p>
          <p>Ihre Sitzung am <strong>${dateStr}</strong> wurde erfolgreich storniert.</p>
          <p>Die Rückerstattung von <strong>€${amount}</strong> wurde veranlasst und wird innerhalb von 5–10 Werktagen auf Ihrem Konto erscheinen.</p>
          <p>Wenn Sie einen neuen Termin vereinbaren möchten, können Sie dies jederzeit über unsere Website tun.</p>
          <p>Mit freundlichen Grüßen,<br>Robert Rozek</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;">
          <p style="font-size: 12px; color: #a8a29e;">Praxis Robert Rozek · Augsburgerstraße 6 · 80337 München<br>
          <a href="https://robertrozek.de" style="color: #b8976a;">robertrozek.de</a></p>
        </div>`
      : `<div style="font-family: Georgia, serif; color: #1c1917; max-width: 600px;">
          <p>Dear ${name},</p>
          <p>Your session on <strong>${dateStr}</strong> has been successfully cancelled.</p>
          <p>A refund of <strong>€${amount}</strong> has been initiated and will appear on your account within 5–10 business days.</p>
          <p>If you would like to book a new session, you can do so anytime on our website.</p>
          <p>Kind regards,<br>Robert Rozek</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;">
          <p style="font-size: 12px; color: #a8a29e;">Praxis Robert Rozek · Augsburgerstraße 6 · 80337 München<br>
          <a href="https://robertrozek.de" style="color: #b8976a;">robertrozek.de</a></p>
        </div>`;

    textBody = isDE
      ? `Liebe/r ${name},\n\nIhre Sitzung am ${dateStr} wurde erfolgreich storniert.\n\nDie Rückerstattung von €${amount} wurde veranlasst und wird innerhalb von 5–10 Werktagen auf Ihrem Konto erscheinen.\n\nMit freundlichen Grüßen,\nRobert Rozek\nPraxis Robert Rozek · Augsburgerstraße 6 · 80337 München`
      : `Dear ${name},\n\nYour session on ${dateStr} has been successfully cancelled.\n\nA refund of €${amount} has been initiated and will appear on your account within 5–10 business days.\n\nKind regards,\nRobert Rozek\nPraxis Robert Rozek · Augsburgerstraße 6 · 80337 München`;
  } else {
    subject = isDE
      ? 'Stornierung eingegangen — keine Rückerstattung'
      : 'Cancellation received — no refund applicable';

    htmlBody = isDE
      ? `<div style="font-family: Georgia, serif; color: #1c1917; max-width: 600px;">
          <p>Liebe/r ${name},</p>
          <p>Ihre Sitzung am <strong>${dateStr}</strong> wurde storniert.</p>
          <p>Da die Stornierung weniger als 24 Stunden vor dem Termin erfolgte, ist gemäß unserer Stornierungsbedingungen leider keine Rückerstattung möglich.</p>
          <p>Bei Fragen stehe ich Ihnen gerne unter <a href="mailto:rozek.therapy@pm.me" style="color: #b8976a;">rozek.therapy@pm.me</a> zur Verfügung.</p>
          <p>Mit freundlichen Grüßen,<br>Robert Rozek</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;">
          <p style="font-size: 12px; color: #a8a29e;">Praxis Robert Rozek · Augsburgerstraße 6 · 80337 München<br>
          <a href="https://robertrozek.de" style="color: #b8976a;">robertrozek.de</a></p>
        </div>`
      : `<div style="font-family: Georgia, serif; color: #1c1917; max-width: 600px;">
          <p>Dear ${name},</p>
          <p>Your session on <strong>${dateStr}</strong> has been cancelled.</p>
          <p>As the cancellation was made less than 24 hours before the session, a refund is not available per our cancellation policy.</p>
          <p>If you have any questions, please contact me at <a href="mailto:rozek.therapy@pm.me" style="color: #b8976a;">rozek.therapy@pm.me</a>.</p>
          <p>Kind regards,<br>Robert Rozek</p>
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin: 24px 0;">
          <p style="font-size: 12px; color: #a8a29e;">Praxis Robert Rozek · Augsburgerstraße 6 · 80337 München<br>
          <a href="https://robertrozek.de" style="color: #b8976a;">robertrozek.de</a></p>
        </div>`;

    textBody = isDE
      ? `Liebe/r ${name},\n\nIhre Sitzung am ${dateStr} wurde storniert.\n\nDa die Stornierung weniger als 24 Stunden vor dem Termin erfolgte, ist leider keine Rückerstattung möglich.\n\nBei Fragen: rozek.therapy@pm.me\n\nMit freundlichen Grüßen,\nRobert Rozek\nPraxis Robert Rozek · Augsburgerstraße 6 · 80337 München`
      : `Dear ${name},\n\nYour session on ${dateStr} has been cancelled.\n\nAs the cancellation was made less than 24 hours before the session, a refund is not available per our cancellation policy.\n\nQuestions: rozek.therapy@pm.me\n\nKind regards,\nRobert Rozek\nPraxis Robert Rozek · Augsburgerstraße 6 · 80337 München`;
  }

  try {
    await transporter.sendMail({
      from: `"${fromName}" <${user}>`,
      to: `"${name}" <${email}>`,
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.log(`[SMTP] Cancellation email sent to ${email} (refunded: ${refunded})`);
    return true;
  } catch (err) {
    console.error(`[SMTP] Cancellation email failed: ${err.message}`);
    return false;
  }
}

// ─── Language detection (same as booking webhook) ───────────

function detectLanguage(booking) {
  const attendee = booking.attendees?.[0];
  const tz = String(attendee?.timeZone || '');
  const langField = attendee?.language;
  const localeField = attendee?.locale;
  const locale = typeof langField === 'string' ? langField
    : typeof localeField === 'string' ? localeField
    : typeof langField?.locale === 'string' ? langField.locale
    : '';
  if (locale.startsWith('de')) return 'de';
  if (/europe\/(berlin|vienna|zurich)/i.test(tz)) return 'de';
  return 'en';
}

// ─── Stripe API helpers ─────────────────────────────────────

const STRIPE_API = 'https://api.stripe.com/v1';

async function stripeRequest(path, method, params) {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not configured');

  const options = {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  if (params && (method === 'POST' || method === 'GET')) {
    const qs = new URLSearchParams(params).toString();
    if (method === 'GET') {
      path += '?' + qs;
    } else {
      options.body = qs;
    }
  }

  const res = await fetch(`${STRIPE_API}${path}`, options);
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Stripe ${res.status}: ${json.error?.message || JSON.stringify(json)}`);
  }
  return json;
}

/**
 * Find the Stripe PaymentIntent for a Cal.com booking.
 * Strategy: search recent successful payments matching the attendee email.
 * For a solo practice with low volume, email + amount is a reliable match.
 */
async function findPaymentIntent(email, amountCents) {
  // Search Stripe payment intents (last 30 days, successful only)
  const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);

  const charges = await stripeRequest('/charges', 'GET', {
    limit: '20',
    'created[gte]': String(thirtyDaysAgo),
  });

  if (!charges.data || charges.data.length === 0) {
    console.log('[Cancellation] No recent charges found in Stripe');
    return null;
  }

  // Find charge matching email and amount
  // Cal.com/Stripe stores customer email in receipt_email or in the charge metadata
  for (const charge of charges.data) {
    const chargeEmail = (
      charge.receipt_email ||
      charge.billing_details?.email ||
      charge.metadata?.email ||
      ''
    ).toLowerCase();

    const matchesEmail = chargeEmail === email.toLowerCase();
    const matchesAmount = !amountCents || charge.amount === amountCents;
    const isSucceeded = charge.status === 'succeeded';
    const notRefunded = !charge.refunded;

    if (matchesEmail && matchesAmount && isSucceeded && notRefunded) {
      console.log(`[Cancellation] Found matching charge: ${charge.id} (${charge.amount / 100} ${charge.currency})`);
      return charge;
    }
  }

  console.log(`[Cancellation] No matching charge found for ${email}`);
  return null;
}

/**
 * Issue a full refund for a Stripe charge.
 */
async function refundCharge(chargeId) {
  const refund = await stripeRequest('/refunds', 'POST', {
    charge: chargeId,
  });
  console.log(`[Cancellation] Refund issued: ${refund.id} (${refund.amount / 100} ${refund.currency})`);
  return refund;
}

// ─── Webhook verification ───────────────────────────────────

function verifyCalcomSignature(payload, signature, secret) {
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  const sig = signature.replace(/^sha256=/, '');
  if (sig.length !== expected.length) return false;
  return crypto.timingSafeEqual(
    Buffer.from(sig),
    Buffer.from(expected)
  );
}

// ─── Main handler ───────────────────────────────────────────

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const signature = req.headers['x-cal-signature-256'] || req.headers['x-calcom-signature'];

  if (process.env.CALCOM_WEBHOOK_SECRET) {
    if (!verifyCalcomSignature(rawBody, signature, process.env.CALCOM_WEBHOOK_SECRET)) {
      console.error('[Cancellation] Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const event = payload.triggerEvent || payload.event;

    // Only process cancellations
    if (event !== 'BOOKING_CANCELLED') {
      return res.status(200).json({ ignored: true, event });
    }

    const booking = payload.payload || payload;
    const attendee = booking.attendees?.[0];
    const startTime = booking.startTime;
    const cancellationReason = booking.cancellationReason || 'No reason provided';
    const bookingId = booking.bookingId || booking.uid;

    if (!attendee?.email) {
      console.error('[Cancellation] Missing attendee email', booking);
      return res.status(400).json({ error: 'Missing attendee email' });
    }

    console.log(`[Cancellation] Booking cancelled: ${attendee.name} <${attendee.email}>`);
    console.log(`[Cancellation] Session was scheduled for: ${startTime}`);
    console.log(`[Cancellation] Reason: ${cancellationReason}`);

    // Check if cancellation is 24+ hours before session
    const sessionDate = new Date(startTime);
    const now = new Date();
    const hoursUntilSession = (sessionDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    console.log(`[Cancellation] Hours until session: ${hoursUntilSession.toFixed(1)}`);

    const lang = detectLanguage(booking);

    if (hoursUntilSession < 24) {
      console.log(`[Cancellation] LATE cancellation (<24h) — no automatic refund`);
      console.log(`[Cancellation] To manually refund: go to Stripe Dashboard → Payments → search for ${attendee.email}`);

      // Notify client: no refund (late cancellation)
      const priceEuros = parseInt(process.env.SESSION_PRICE_CENTS || '15000', 10) / 100;
      await sendCancellationEmail({
        email: attendee.email,
        name: attendee.name,
        lang,
        refunded: false,
        amount: priceEuros,
        sessionDate: startTime,
      });

      return res.status(200).json({
        success: true,
        refunded: false,
        reason: 'late_cancellation',
        hoursUntilSession: Math.round(hoursUntilSession * 10) / 10,
        message: `Cancelled ${hoursUntilSession.toFixed(1)}h before session. Policy requires 24h notice. No automatic refund.`,
        manualRefundInstructions: `Stripe Dashboard → Payments → search ${attendee.email}`,
      });
    }

    // Eligible for refund — find and refund the Stripe charge
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('[Cancellation] STRIPE_SECRET_KEY not configured — cannot process refund');
      return res.status(200).json({
        success: true,
        refunded: false,
        reason: 'stripe_not_configured',
        message: 'Cancellation eligible for refund but Stripe key not configured. Refund manually.',
      });
    }

    const priceCents = parseInt(process.env.SESSION_PRICE_CENTS || '15000', 10);
    const charge = await findPaymentIntent(attendee.email, priceCents);

    if (!charge) {
      console.warn(`[Cancellation] No matching Stripe charge found for ${attendee.email} — refund manually`);
      return res.status(200).json({
        success: true,
        refunded: false,
        reason: 'charge_not_found',
        message: `Eligible for refund but no matching Stripe charge found. Refund manually in Stripe Dashboard.`,
        manualRefundInstructions: `Stripe Dashboard → Payments → search ${attendee.email}`,
      });
    }

    const refund = await refundCharge(charge.id);

    console.log(`[Cancellation] AUTO-REFUND successful: €${refund.amount / 100} to ${attendee.email}`);

    // Notify client: refund confirmed
    await sendCancellationEmail({
      email: attendee.email,
      name: attendee.name,
      lang,
      refunded: true,
      amount: refund.amount / 100,
      sessionDate: startTime,
    });

    return res.status(200).json({
      success: true,
      refunded: true,
      refundId: refund.id,
      amount: refund.amount / 100,
      currency: refund.currency,
      attendee: { name: attendee.name, email: attendee.email },
      hoursUntilSession: Math.round(hoursUntilSession * 10) / 10,
    });

  } catch (err) {
    console.error('[Cancellation] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

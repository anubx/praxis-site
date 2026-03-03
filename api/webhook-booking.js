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
 *   ESIGN_PROVIDER         = "openapi" | "docusign"
 *   (plus provider-specific vars — see esign-provider.js)
 */

const crypto = require('crypto');
const { sendForSignature, hasAlreadySigned } = require('./esign-provider');

function verifyCalcomSignature(payload, signature, secret) {
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

/**
 * Detect language from Cal.com booking data.
 * Heuristic: check timezone, locale, or location fields.
 */
function detectLanguage(booking) {
  const tz = booking.attendees?.[0]?.timeZone || '';
  const locale = booking.attendees?.[0]?.language || booking.attendees?.[0]?.locale || '';

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

    // Check if this client has already signed intake documents
    const alreadySigned = await hasAlreadySigned(attendee.email);

    if (alreadySigned) {
      console.log(`Client ${attendee.email} already signed — skipping e-sign request`);
      return res.status(200).json({
        success: true,
        skipped: true,
        reason: 'already_signed',
      });
    }

    console.log(`Sending e-sign request: ${attendee.name} <${attendee.email}> [${lang}]`);

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

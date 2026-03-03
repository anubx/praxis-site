/**
 * POST /api/esign-callback
 *
 * Callback endpoint for e-signature providers.
 * Called when a client completes (or declines) signing.
 *
 * OpenAPI sends a POST with status updates.
 * DocuSign uses Connect webhooks (configured in DocuSign admin).
 *
 * This handler logs the event. Extend it to:
 *   - Send confirmation email to practitioner
 *   - Download and store signed PDF
 *   - Update a CRM or spreadsheet
 */

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const provider = process.env.ESIGN_PROVIDER || 'openapi';

    if (provider === 'openapi') {
      const { id, status, signers } = payload;
      console.log(`[OpenAPI callback] Request ${id}: ${status}`);

      if (status === 'COMPLETED') {
        console.log(`Signing completed for request ${id}`);
        // TODO: Download signed doc via GET /signatures/{id}/document
        // TODO: Notify practitioner via email
      }
    }

    if (provider === 'docusign') {
      // DocuSign Connect webhook format
      const envelopeId = payload.envelopeId || payload.EnvelopeID;
      const status = payload.status || payload.Status;
      console.log(`[DocuSign callback] Envelope ${envelopeId}: ${status}`);

      if (status === 'completed' || status === 'Completed') {
        console.log(`Signing completed for envelope ${envelopeId}`);
        // TODO: Download signed doc via DocuSign API
        // TODO: Notify practitioner via email
      }
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Callback error:', err);
    return res.status(500).json({ error: err.message });
  }
};

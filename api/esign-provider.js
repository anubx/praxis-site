/**
 * E-Signature Provider Abstraction
 * Swappable between OpenAPI (EU-SES) and DocuSign
 *
 * ENV vars required:
 *   ESIGN_PROVIDER        = "openapi" | "docusign" | "none" (default: "none")
 *
 *   # OpenAPI
 *   OPENAPI_API_KEY        = your openapi.com API key
 *   OPENAPI_CALLBACK_URL   = https://yoursite.vercel.app/api/esign-callback
 *
 *   # DocuSign
 *   DOCUSIGN_INTEGRATION_KEY  = OAuth integration key
 *   DOCUSIGN_USER_ID          = impersonated user GUID
 *   DOCUSIGN_ACCOUNT_ID       = account ID
 *   DOCUSIGN_BASE_URL         = https://eu.docusign.net/restapi (EU) or https://na4.docusign.net/restapi (US)
 *   DOCUSIGN_PRIVATE_KEY      = RSA private key (base64 encoded)
 */

const INTAKE_DOCS = {
  de: '/docs/intake-combined-de.pdf',
  en: '/docs/intake-combined-en.pdf',
};

// ─── OpenAPI EU-SES ─────────────────────────────────────────

async function sendViaOpenAPI({ name, email, phone, lang, siteUrl }) {
  const docUrl = `${siteUrl}${INTAKE_DOCS[lang] || INTAKE_DOCS.en}`;

  // Split name into first/last for OpenAPI's name/surname fields
  const nameParts = name.trim().split(/\s+/);
  const firstName = nameParts[0] || name;
  const surname = nameParts.slice(1).join(' ') || name;

  // OpenAPI EU-SES API — aligned with playground (console.openapi.com):
  // - signers[].authentication is a STRING: "email" or "sms" (NOT an array)
  // - signers[].signatures[].page is a number (0-indexed, 0 = first page)
  // - signers[].signatures[].x and y are strings
  // - inputDocuments can be a URL string directly
  // - options.signatureMode is an array of strings: ["typed", "drawn"]
  // - completeUrl/cancelUrl go inside options (SES Options section)
  // - callback.method defaults to "JSON"
  const body = {
    title: lang === 'de'
      ? 'Aufnahmedokumente — Praxis Robert Rozek'
      : 'Intake Documents — Robert Rozek Practice',
    description: lang === 'de'
      ? 'Bitte lesen und unterschreiben Sie die Aufnahmedokumente vor Ihrer ersten Sitzung.'
      : 'Please read and sign the intake documents before your first session.',
    signers: [
      {
        name: firstName,
        surname: surname,
        email,
        mobile: phone || undefined,
        authentication: phone ? 'sms' : 'email',
        // Single signature on the last page — "Unterschrift des Klienten" line.
        // Updated PDF has 6 pages (0-indexed: 0-5), signature block on page 5.
        // Coordinates: OpenAPI uses top-left origin, values in points (A4 = 595 x 842).
        // "Unterschrift des Klienten" label is at ~109pt from top (pdfplumber).
        // Place signature just above the label line.
        signatures: [
          { page: 5, x: '63', y: '90' },
        ],
      },
    ],
    inputDocuments: docUrl,
    callback: {
      url: process.env.OPENAPI_CALLBACK_URL,
      method: 'JSON',
      field: 'data',
    },
    options: {
      signatureMode: ['typed', 'drawn'],
      timezone: 'Europe/Berlin',
      ui: {
        completeUrl: `${siteUrl}/signed?status=complete`,
        cancelUrl: `${siteUrl}/signed?status=cancelled`,
        sidebarBackgroundColor: '#1c1917',
        sidebarTextColor: '#b8976a',
        headerTitleColor: '#1c1917',
        headerSubtitleColor: '#a8a29e',
        headerBackgroundColor: '#fafaf9',
        footerBackgroundColor: '#fafaf9',
        buttonBackgroundColor: '#fafaf9',
        buttonBackgroundColorHover: '#e7e5e4',
        buttonTextColor: '#1c1917',
        buttonTextColorHover: '#1c1917',
        signButtonBackgroundColor: '#b8976a',
        signButtonTextColor: '#1c1917',
        signButtonTextColorHover: '#fafaf9',
        signButtonBackgroundColorHover: '#a68555',
      },
    },
  };

  // Use test endpoint if OPENAPI_SANDBOX=true, otherwise production
  const baseUrl = process.env.OPENAPI_SANDBOX === 'true'
    ? 'https://test.esignature.openapi.com'
    : 'https://esignature.openapi.com';

  const res = await fetch(`${baseUrl}/EU-SES`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAPI_API_KEY}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAPI EU-SES error ${res.status}: ${err}`);
  }

  const json = await res.json();
  // OpenAPI wraps the response in { data: { ... }, success: true }
  const data = json.data || json;
  return {
    provider: 'openapi',
    requestId: data.id,
    signingUrl: data.signers?.[0]?.url || null,
    status: data.state,
    raw: data,
  };
}

// ─── DocuSign ───────────────────────────────────────────────

async function getDocuSignAccessToken() {
  const jwt = await createDocuSignJWT();
  const res = await fetch('https://account-d.docusign.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DocuSign auth error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function createDocuSignJWT() {
  // JWT creation for DocuSign — uses jsonwebtoken at runtime
  // For Vercel, install jsonwebtoken as dependency
  const jwt = require('jsonwebtoken');
  const privateKey = Buffer.from(process.env.DOCUSIGN_PRIVATE_KEY, 'base64').toString('utf-8');
  const now = Math.floor(Date.now() / 1000);

  return jwt.sign(
    {
      iss: process.env.DOCUSIGN_INTEGRATION_KEY,
      sub: process.env.DOCUSIGN_USER_ID,
      aud: 'account-d.docusign.com',
      iat: now,
      exp: now + 3600,
      scope: 'signature impersonation',
    },
    privateKey,
    { algorithm: 'RS256' }
  );
}

async function sendViaDocuSign({ name, email, phone, lang, siteUrl }) {
  const token = await getDocuSignAccessToken();
  const baseUrl = process.env.DOCUSIGN_BASE_URL;
  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;

  // Fetch the combined intake PDF as base64
  const docUrl = `${siteUrl}${INTAKE_DOCS[lang] || INTAKE_DOCS.en}`;
  const pdfRes = await fetch(docUrl);
  const pdfBuffer = await pdfRes.arrayBuffer();
  const pdfBase64 = Buffer.from(pdfBuffer).toString('base64');

  const envelope = {
    emailSubject: lang === 'de'
      ? 'Aufnahmedokumente — Praxis Robert Rozek'
      : 'Intake Documents — Robert Rozek Practice',
    emailBlurb: lang === 'de'
      ? 'Bitte lesen und unterschreiben Sie die folgenden Dokumente vor Ihrer ersten Sitzung.'
      : 'Please read and sign the following documents before your first session.',
    documents: [
      {
        documentBase64: pdfBase64,
        name: lang === 'de' ? 'Aufnahmedokumente.pdf' : 'Intake-Documents.pdf',
        fileExtension: 'pdf',
        documentId: '1',
      },
    ],
    recipients: {
      signers: [
        {
          email,
          name,
          recipientId: '1',
          routingOrder: '1',
          tabs: {
            signHereTabs: [
              {
                documentId: '1',
                pageNumber: '9',
                xPosition: '100',
                yPosition: '600',
              },
            ],
          },
        },
      ],
    },
    status: 'sent',
  };

  const res = await fetch(`${baseUrl}/v2.1/accounts/${accountId}/envelopes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(envelope),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`DocuSign error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return {
    provider: 'docusign',
    requestId: data.envelopeId,
    signingUrl: null, // DocuSign sends email directly
    status: data.status,
    raw: data,
  };
}

// ─── Already Signed Checks ──────────────────────────────────

/**
 * Check OpenAPI for completed signatures by this email.
 * Queries the signatures list endpoint filtered by email.
 */
async function hasSignedViaOpenAPI(email) {
  try {
    const baseUrl = process.env.OPENAPI_SANDBOX === 'true'
      ? 'https://test.esignature.openapi.com'
      : 'https://esignature.openapi.com';

    // GET /signatures returns a list of all signature requests
    // Filter client-side by signer email and completed state
    const res = await fetch(`${baseUrl}/signatures`, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAPI_API_KEY}`,
      },
    });

    if (!res.ok) {
      console.warn(`OpenAPI signature check failed (${res.status}), proceeding with send`);
      return false;
    }

    const data = await res.json();
    const signatures = Array.isArray(data) ? data : data.data || [];

    // Check if any completed signature has this email as a signer
    return signatures.some(
      (sig) => sig.state === 'COMPLETED' &&
        sig.signers?.some((s) => s.email?.toLowerCase() === email.toLowerCase())
    );
  } catch (err) {
    console.warn('OpenAPI signature check error, proceeding with send:', err.message);
    return false;
  }
}

/**
 * Check DocuSign for completed envelopes sent to this email.
 * Uses the Envelopes: listStatusChanges endpoint filtered by recipient email.
 */
async function hasSignedViaDocuSign(email) {
  try {
    const token = await getDocuSignAccessToken();
    const baseUrl = process.env.DOCUSIGN_BASE_URL;
    const accountId = process.env.DOCUSIGN_ACCOUNT_ID;

    // Search for completed envelopes where this email was a recipient
    // Look back 2 years to cover all possible previous signings
    const fromDate = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000).toISOString();
    const searchUrl = `${baseUrl}/v2.1/accounts/${accountId}/envelopes` +
      `?from_date=${encodeURIComponent(fromDate)}` +
      `&status=completed` +
      `&search_text=${encodeURIComponent(email)}`;

    const res = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      console.warn(`DocuSign envelope check failed (${res.status}), proceeding with send`);
      return false;
    }

    const data = await res.json();
    const count = parseInt(data.totalSetSize || data.resultSetSize || '0', 10);
    return count > 0;
  } catch (err) {
    console.warn('DocuSign envelope check error, proceeding with send:', err.message);
    return false;
  }
}

// ─── Public API ─────────────────────────────────────────────

/**
 * Check if a client has already signed intake documents.
 * Queries the active e-signature provider for completed signatures.
 *
 * @param {string} email - Client email
 * @returns {Promise<boolean>} - true if already signed
 */
async function hasAlreadySigned(email) {
  const provider = process.env.ESIGN_PROVIDER || 'none';

  switch (provider) {
    case 'openapi':
      return hasSignedViaOpenAPI(email);
    case 'docusign':
      return hasSignedViaDocuSign(email);
    case 'none':
    default:
      return false;
  }
}

/**
 * Send intake documents for e-signature.
 * Automatically routes to the configured provider.
 *
 * @param {Object} opts
 * @param {string} opts.name      - Client full name
 * @param {string} opts.email     - Client email
 * @param {string} [opts.phone]   - Client phone (for OTP)
 * @param {string} opts.lang      - "de" or "en"
 * @param {string} opts.siteUrl   - Base URL of the site (e.g., https://praxis-site-vert.vercel.app)
 * @returns {Promise<Object>}     - { provider, requestId, signingUrl, status, raw }
 */
async function sendForSignature(opts) {
  const provider = process.env.ESIGN_PROVIDER || 'none';

  switch (provider) {
    case 'openapi':
      return sendViaOpenAPI(opts);
    case 'docusign':
      return sendViaDocuSign(opts);
    case 'none':
      throw new Error('E-signing is disabled (ESIGN_PROVIDER=none). Set to "openapi" or "docusign" to enable.');
    default:
      throw new Error(`Unknown e-sign provider: ${provider}`);
  }
}

module.exports = { sendForSignature, hasAlreadySigned, INTAKE_DOCS };

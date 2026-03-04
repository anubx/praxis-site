# Psychoanalytic Practice — Landing Page

Static site + serverless functions on Vercel.

## Deploy

```bash
git push  # auto-deploys via GitHub → Vercel
```

**Important**: Vercel does NOT redeploy when you change env vars. After updating env vars, click Redeploy in the Vercel dashboard manually.

## File Map

| File | Purpose | When to edit |
|---|---|---|
| `public/index.html` | Main landing page (DE/EU market, cal.com embed) | Bio, pricing, tracking IDs, styling |
| `public/coaching.html` | US coaching variant (placeholder) | Build out for US market launch |
| `public/datenschutz.html` | Privacy policy (DSGVO) | Data processing details, tool changes |
| `public/impressum.html` | Legal notice (§ 5 TMG) | Address, credentials, authority |
| `public/docs/*.pdf` | Client intake documents (4 EN + 4 DE + 2 combined) | Regenerate via `generate_client_docs.py` |
| `api/webhook-booking.js` | Cal.com webhook → e-signature flow | Webhook logic, language detection |
| `api/esign-provider.js` | Swappable e-signature module (OpenAPI / DocuSign) | Provider config, signature placement |
| `api/esign-callback.js` | Callback from e-signature providers | Post-signing actions (email, storage) |
| `vercel.json` | Routing, headers, serverless config | New routes, security headers |
| `.env.example` | Template for all required env vars | Reference when setting up new env |

### Common edits

- **Change session price**: search `€150` in index.html + update Cal.com event type + regenerate PDFs
- **Change cal.com link**: search `rozek.therapy/session` in index.html (4 occurrences — nav, hero, pricing, CTA)
- **Switch e-sign provider**: change `ESIGN_PROVIDER` env var in Vercel (`openapi` or `docusign`)
- **Update tracking IDs**: search `G-PJGQ4RBY5R` (GA4), `vnzaph1mar` (Clarity), `AW-` (Ads)
- **Update address/email**: search `Augsburgerstraße 6` and `rozek.therapy@pm.me`

### Placeholders still remaining

| Placeholder | File(s) | Status |
|---|---|---|
| `AW-XXXXXXXXX` | `index.html` | Commented out — uncomment when Google Ads campaign is created |
| `CONVERSION_LABEL` | `index.html` | Set after creating Ads conversion action |
| coaching.html content | `public/coaching.html` | Placeholder, redirects to `/` — build out for US launch |

## Structure

```
public/
  index.html               — Main landing page (DE/EU, cal.com embed + tracking)
  coaching.html             — US coaching variant (placeholder)
  datenschutz.html          — Privacy policy (DSGVO)
  impressum.html            — Legal notice (TMG)
  docs/
    behandlungsvertrag-de.pdf
    datenschutz-vereinbarung-de.pdf
    einwilligung-de.pdf
    telehealth-einwilligung-de.pdf
    treatment-contract-en.pdf
    privacy-agreement-en.pdf
    informed-consent-en.pdf
    telehealth-consent-en.pdf
    intake-combined-de.pdf   — All 4 DE docs merged (9 pages, used by e-sign)
    intake-combined-en.pdf   — All 4 EN docs merged (9 pages, used by e-sign)
api/
  webhook-booking.js         — Cal.com BOOKING_CREATED handler
  esign-provider.js          — Swappable OpenAPI / DocuSign module
  esign-callback.js          — Signature completion callback
vercel.json                  — Vercel routing + headers + function config
.env.example                 — Template for env vars
```

## Stack

- **Scheduling**: Cal.com (embedded modal on page, `rozek.therapy/session`)
- **Payment**: Stripe (via Cal.com native integration, €150 prepay)
- **E-signatures**: DocuSign (US/testing) / OpenAPI EU-SES (EU, pending data residency confirmation)
- **Video (DE/EU)**: RED Medical — RED connect plus (peer-to-peer, E2E encrypted, DSGVO)
- **Video (US)**: Doxy.me (planned) or RED Medical
- **Analytics**: GA4 (`G-PJGQ4RBY5R`) + Microsoft Clarity (`vnzaph1mar`)
- **Ads**: Google Ads (pending campaign creation)
- **Hosting**: Vercel (static + serverless functions)

## Booking Flow

```
Visitor lands on site
  → Clicks "Book" → Cal.com modal opens
  → Picks time slot → Stripe collects €150 prepayment
  → Booking confirmed → Cal.com fires BOOKING_CREATED webhook
  → /api/webhook-booking receives it
  → Checks e-sign provider: has this email already signed?
    → YES: skip (returning client)
    → NO: send combined intake PDF for e-signature
  → Client signs documents via DocuSign/OpenAPI
  → Video session via RED Medical / Doxy.me
```

## Environment Variables (Vercel)

All set in Vercel Dashboard → Settings → Environment Variables → All Environments.

| Variable | Purpose |
|---|---|
| `ESIGN_PROVIDER` | `docusign` or `openapi` — switches e-sign provider |
| `SITE_URL` | `https://praxis-site-vert.vercel.app` |
| `CALCOM_WEBHOOK_SECRET` | Cal.com webhook signing secret |
| `DOCUSIGN_INTEGRATION_KEY` | DocuSign OAuth integration key |
| `DOCUSIGN_USER_ID` | DocuSign user GUID (NOT the keypair ID!) |
| `DOCUSIGN_ACCOUNT_ID` | DocuSign API account ID (GUID format) |
| `DOCUSIGN_BASE_URL` | `https://demo.docusign.net/restapi` (sandbox) or `https://eu.docusign.net/restapi` (production EU) |
| `DOCUSIGN_PRIVATE_KEY` | Base64-encoded RSA private key |
| `OPENAPI_API_KEY` | OpenAPI.com API key (when using OpenAPI provider) |
| `OPENAPI_CALLBACK_URL` | Callback URL for OpenAPI (when using OpenAPI provider) |

## Cal.com Setup

1. Sign up at cal.com
2. Connect Stripe in Settings → Apps → Stripe
3. Create event type "session" with €150 prepayment via Stripe
4. The Cal.com embed slug is `rozek.therapy/session` (embedded in index.html at 4 locations)
5. Webhook: Settings → Developer → Webhooks → `BOOKING_CREATED` → `https://praxis-site-vert.vercel.app/api/webhook-booking`

**Caveat**: Stripe payment setup is under Apps (App Store → Stripe), NOT under Settings → Payments (this menu item doesn't exist in Cal.com).

## DocuSign Setup

1. Create developer account at developers.docusign.com
2. Apps and Keys → Add App → "Praxis E-Sign" → Private custom integration
3. Under Service Integration → Generate RSA keypair → save the private key (shown only once!)
4. Under Additional Settings → Add Redirect URI: `https://praxis-site-vert.vercel.app/api/esign-callback`
5. Grant consent by opening: `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=https://praxis-site-vert.vercel.app/api/esign-callback`
6. The redirect will 404 — that's expected, consent is saved server-side
7. Base64 encode the private key: `base64 -i private.key` (Mac) or `base64 -w 0 private.key` (Linux)
8. Add all env vars to Vercel, then redeploy

**Caveats / Gotchas**:

- `DOCUSIGN_USER_ID` is your **User ID** from the top of Apps and Keys page, NOT the RSA Keypair ID. These are different GUIDs. Getting them confused causes `user_not_found` auth errors.
- `DOCUSIGN_ACCOUNT_ID` is the **API Account ID** in GUID format (`xxxxxxxx-xxxx-xxxx-...`), not the short numeric account number.
- DocuSign `pageNumber` must be an integer string (e.g., `'9'`), not `'last'`. The combined intake PDF is 9 pages.
- After changing env vars in Vercel, you must manually Redeploy — it doesn't auto-redeploy.
- The RSA private key must be base64-encoded for the env var (newlines in env vars break things).
- Demo base URL: `https://demo.docusign.net/restapi`. Production EU: `https://eu.docusign.net/restapi`. Production US: `https://na4.docusign.net/restapi`.

## OpenAPI EU-SES Setup (Pending)

Evaluation in progress. Email sent to openapi@legalmail.it asking about:

1. Data residency (which Google Cloud region?)
2. TSP infrastructure (Namirial — does data pass through OpenAPI's cloud first?)
3. AVV (Art. 28 DSGVO) for health data (Art. 9)
4. Data retention configurability (immediate deletion after download?)
5. Sub-processor list and locations

**Key findings from T&C review (19 pages)**:
- OpenAPI is Italian (Rome), uses Google Cloud (SOC 1/2 Type II)
- TSP is Namirial (eIDAS-accredited, AgID-supervised)
- Signed docs stored 3 months, audit trails 10 years (Art. 12.11)
- T&C do NOT specify data center locations — this is the open question
- Governed by Italian law, Court of Rome jurisdiction (Art. 18)
- €0.09/signature on annual plan, €0.49 prepaid single

**Legal assessment**:
- Italy (EU) hosting is legally fine under GDPR — no requirement for German data center
- The real question is whether any sub-processor routes data outside the EU
- For Heilpraktiker contracts (BGB service agreements), AES is sufficient — QES not required
- GDPR penalties for health data: up to €20M / 4% turnover (theoretical max), realistically warnings or low thousands for a solo practice with no breach

## E-Signature Provider Comparison

| | OpenAPI EU-SES | DocuSign |
|---|---|---|
| **Cost** | €0.09/signature (annual) | €14/month flat |
| **Break-even** | Cheaper below ~155 clients/month | Cheaper above ~155 clients/month |
| **Data location** | EU (pending confirmation) | Configurable (EU/US) |
| **eIDAS level** | SES with OTP | SES/AES/QES |
| **DSGVO** | Pending AVV confirmation | AVV available |
| **API** | REST, real-time | REST, mature |
| **Best for** | EU market (if confirmed) | US market, immediate use |

**Strategy**: Use DocuSign now (works, tested). Switch to OpenAPI for EU market if/when data residency is confirmed. The `ESIGN_PROVIDER` env var makes switching a one-line change.

## Dual Market Strategy

| | DE/EU Market | US Market |
|---|---|---|
| **Page** | `index.html` | `coaching.html` (placeholder) |
| **Route** | `/` | `/coaching` |
| **Framing** | Psychotherapie / Psychologische Beratung | Psychoanalytic Coaching |
| **Price** | €150 | $150 |
| **E-sign** | OpenAPI (pending) or DocuSign EU | DocuSign US |
| **Video** | RED Medical (DSGVO) | Doxy.me or RED Medical |
| **Legal** | Heilpraktikergesetz, DSGVO, eIDAS | No HIPAA (private pay), CCPA notice |
| **Cal.com** | `rozek.therapy/session` | Separate event type (USD) |

## Bugs Encountered & Fixed

### 1. Cal.com `language` field is an object, not a string
**Error**: `locale.startsWith is not a function`
**Fix**: Normalize language/locale field — check `typeof` before calling string methods. Cal.com sends `language` as an object with nested `.locale` property.

### 2. DocuSign `pageNumber` must be integer
**Error**: `Integer value expected for parameter: 'pageNumber'`
**Fix**: Changed from `'last'` to `'9'` (combined PDF is 9 pages). DocuSign doesn't support `'last'` keyword.

### 3. DocuSign `user_not_found` auth error
**Error**: `invalid_grant: user_not_found`
**Cause**: Used the RSA Keypair ID instead of the actual User ID for `DOCUSIGN_USER_ID`.
**Fix**: Get the correct User ID from the top of the Apps and Keys page under "My Account Information".

### 4. Webhook signature verification crash
**Error**: `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` — `timingSafeEqual` requires same-length buffers
**Cause**: Cal.com signature format differs from expected. When no secret is configured in Cal.com, it sends `x-cal-signature-256: no-secret-provided`.
**Status**: Signature verification temporarily disabled. Re-enable after confirming Cal.com's exact signature header format.

### 5. Vercel env vars don't trigger redeploy
**Symptom**: Code deployed but functions use stale/missing env vars.
**Fix**: Always manually redeploy after changing env vars in Vercel dashboard.

### 6. Git HEAD.lock stale file
**Error**: `cannot lock ref 'HEAD': Unable to create HEAD.lock: File exists`
**Fix**: `rm -f .git/HEAD.lock` — caused by interrupted git operations.

## TODO / Remaining Work

- [ ] Re-enable webhook signature verification (fix Cal.com header format)
- [ ] Rotate DocuSign RSA keypair (private key was shared in chat during setup)
- [ ] Switch DocuSign from sandbox to production when ready
- [ ] Build out coaching.html for US market
- [ ] Create separate Cal.com event type for US coaching (USD pricing)
- [ ] Set up Doxy.me for US video sessions (or confirm RED Medical for all)
- [ ] Await OpenAPI response on data residency → switch EU market if confirmed
- [ ] Remove debug logging from webhook-booking.js when stable
- [ ] Update privacy-agreement-en.pdf (still references "It's Complicated, Doctolib, or RED Medical")
- [ ] Set Cal.com price back to €150 after testing
- [ ] Uncomment Google Ads tracking when campaign is created

## Decision Log

### 2026-03-04 — E-Signature: DocuSign (now) + OpenAPI EU-SES (pending)

**Decision**: Use DocuSign immediately for e-signatures. Evaluate OpenAPI EU-SES for the EU market pending data residency confirmation.

**Reasoning**: DocuSign works, is tested, and supports EU data hosting. OpenAPI is cheaper (€0.09 vs €14/month) but needs confirmed EU-only data processing for health data under Art. 9 DSGVO. The `ESIGN_PROVIDER` env var allows switching with zero code changes.

### 2026-03-04 — Combined Intake Document: One Signature Per Client

**Decision**: Merge all 4 intake documents (treatment contract, informed consent, privacy agreement, telehealth consent) into one combined PDF per language. One signature covers all documents.

**Reasoning**: Cheaper (€0.09 instead of €0.36 per client on OpenAPI), simpler UX for clients, standard practice for Heilpraktiker intake. Legally sound — one signature on a combined document covering all sections.

### 2026-03-04 — Returning Client Check: Query E-Sign Provider Directly

**Decision**: Check the e-signature provider (DocuSign/OpenAPI) for completed envelopes before sending new documents. No separate database.

**Reasoning**: Avoids storing client emails in a separate database (GDPR/DSGVO data minimization). The e-sign provider already has the data as a legitimate processor. If a prior signing attempt failed/was abandoned, the check correctly returns "not signed" and re-sends. No extra data processing, no AVV needed for an additional processor.

### 2026-03-04 — Dual Market: Same Repo, Route-Based Separation

**Decision**: US coaching site at `/coaching` within the same Vercel project, not a separate repo.

**Reasoning**: Shared codebase (serverless functions, docs), easier maintenance. Different content/legal pages per route. Different Cal.com event types and e-sign provider per market via env vars or route-based logic.

### 2026-03-04 — Stripe Prepayment: Via Cal.com Native Integration

**Decision**: Use Cal.com's built-in Stripe integration for €150 prepayment, no custom payment code.

**Reasoning**: Cal.com handles PaymentIntent creation, confirmation, and links payment to booking. Refunds manageable from Cal.com dashboard. Zero custom code for payments.

**Setup**: Cal.com → Apps → App Store → Stripe (NOT Settings → Payments, which doesn't exist). Then enable "Require payment" on the event type.

### 2026-02-28 — Stack: Cal.com + Stripe + RED Medical

**Decision**: Consolidate to a single booking flow — Cal.com embedded on the landing page, Stripe for prepayment, RED Medical for video sessions.

**Reasoning**: Cal.com embeds as inline modal (lowest friction), native Stripe integration, single page to maintain. Removed It's Complicated, Doctolib variants.

**Trade-off**: Lost It's Complicated directory listing for organic discovery. Mitigated by Google Ads.

### 2026-02-28 — RED Medical: Internationally Legal

**Decision**: Use RED Medical (RED connect plus) for all video sessions including international.

**Reasoning**: Works worldwide, no IP restrictions. E2E encrypted peer-to-peer. KBV-certified. As Heilpraktiker (not GKV-billed), no billing constraints on international use.

### 2026-02-28 — BetterHelp Ratings: Do Not Display

**Decision**: Do not embed BetterHelp ratings/reviews.

**Reasoning**: FTC Consumer Review Rule exposure (up to $53k/violation). BetterHelp ToS restricts repurposing.

### 2026-02-28 — LegitScript Certification: Not Required

**Decision**: Skip LegitScript.

**Reasoning**: Only required for addiction treatment advertising. Psychoanalytic counseling/psychotherapy not covered.

### 2026-02-28 — London Ltd Structure: Not Viable

**Decision**: Do not use London Ltd for Munich practice.

**Reasoning**: Permanent establishment rules trigger German corporate tax (~29-33%) regardless. No benefit, added compliance burden.

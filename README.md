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
| `public/impressum.html` | Legal notice (§ 5 DDG) | Address, credentials, authority |
| `public/docs/*.pdf` | Client intake documents (2 combined PDFs, 6 pages each) | Regenerate via `generate-intake-pdfs.py` |
| `generate-intake-pdfs.py` | reportlab script to regenerate combined intake PDFs | Pricing, qualifications, signature layout |
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
  impressum.html            — Legal notice (§ 5 DDG)
  docs/
    intake-combined-de.pdf   — All 4 DE docs merged (6 pages, single signature block)
    intake-combined-en.pdf   — All 4 EN docs merged (6 pages, single signature block)
api/
  webhook-booking.js         — Cal.com BOOKING_CREATED handler
  esign-provider.js          — Swappable OpenAPI / DocuSign module
  esign-callback.js          — Signature completion callback
generate-intake-pdfs.py      — reportlab script to regenerate combined intake PDFs
DancingScript.ttf            — Google Fonts handwriting font (for therapist signature)
vercel.json                  — Vercel routing + headers + function config
.env.example                 — Template for env vars
```

## Stack

- **Scheduling**: Cal.com (embedded modal on page, `rozek.therapy/session`)
- **Payment**: Stripe (via Cal.com native integration, €150 prepay)
- **E-signatures**: OpenAPI EU-SES (EU market, active) / DocuSign (US market, feature-flagged)
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
| `ESIGN_PROVIDER` | `openapi` or `docusign` or `none` — switches e-sign provider |
| `SITE_URL` | `https://robertrozek.de` |
| `CALCOM_WEBHOOK_SECRET` | Cal.com webhook signing secret (must match Cal.com webhook config) |
| `OPENAPI_API_KEY` | OpenAPI.com API token (hex format, from console.openapi.com) |
| `OPENAPI_CALLBACK_URL` | `https://robertrozek.de/api/esign-callback` |
| `OPENAPI_SANDBOX` | `true` for sandbox (`test.esignature.openapi.com`), omit or `false` for production |
| `DOCUSIGN_INTEGRATION_KEY` | DocuSign OAuth integration key (only if using DocuSign) |
| `DOCUSIGN_USER_ID` | DocuSign user GUID — NOT the keypair ID! (only if using DocuSign) |
| `DOCUSIGN_ACCOUNT_ID` | DocuSign API account ID in GUID format (only if using DocuSign) |
| `DOCUSIGN_BASE_URL` | `https://demo.docusign.net/restapi` (sandbox) or `https://eu.docusign.net/restapi` (production EU) |
| `DOCUSIGN_PRIVATE_KEY` | Base64-encoded RSA private key (only if using DocuSign) |

## Cal.com Setup

1. Sign up at cal.com
2. Connect Stripe in Settings → Apps → Stripe
3. Create event type "session" with €150 prepayment via Stripe
4. The Cal.com embed slug is `rozek.therapy/session` (embedded in index.html at 4 locations)
5. Webhook: Settings → Developer → Webhooks → `BOOKING_CREATED` → `https://robertrozek.de/api/webhook-booking`
6. **Set the webhook secret** in Cal.com (edit webhook → Secret field) — must match `CALCOM_WEBHOOK_SECRET` in Vercel. Without this, Cal.com sends `x-cal-signature-256: no-secret-provided` and signature verification fails.

**Caveats**:
- Stripe payment setup is under Apps (App Store → Stripe), NOT under Settings → Payments (this menu item doesn't exist in Cal.com).
- Cal.com sends the `language` field as an **object** with a nested `.locale` property, not a string. Check `typeof` before calling string methods.
- Cal.com prefixes webhook signatures with `sha256=` — the verification code must strip this prefix before comparing.

## DocuSign Setup

1. Create developer account at developers.docusign.com
2. Apps and Keys → Add App → "Praxis E-Sign" → Private custom integration
3. Under Service Integration → Generate RSA keypair → save the private key (shown only once!)
4. Under Additional Settings → Add Redirect URI: `https://robertrozek.de/api/esign-callback`
5. Grant consent by opening: `https://account-d.docusign.com/oauth/auth?response_type=code&scope=signature%20impersonation&client_id=YOUR_INTEGRATION_KEY&redirect_uri=https://robertrozek.de/api/esign-callback`
6. The redirect will 404 — that's expected, consent is saved server-side
7. Base64 encode the private key: `base64 -i private.key` (Mac) or `base64 -w 0 private.key` (Linux)
8. Add all env vars to Vercel, then redeploy

**Caveats / Gotchas**:

- `DOCUSIGN_USER_ID` is your **User ID** from the top of Apps and Keys page, NOT the RSA Keypair ID. These are different GUIDs. Getting them confused causes `user_not_found` auth errors.
- `DOCUSIGN_ACCOUNT_ID` is the **API Account ID** in GUID format (`xxxxxxxx-xxxx-xxxx-...`), not the short numeric account number.
- DocuSign `pageNumber` must be an integer string (e.g., `'6'`), not `'last'`. The combined intake PDF is 6 pages.
- After changing env vars in Vercel, you must manually Redeploy — it doesn't auto-redeploy.
- The RSA private key must be base64-encoded for the env var (newlines in env vars break things).
- Demo base URL: `https://demo.docusign.net/restapi`. Production EU: `https://eu.docusign.net/restapi`. Production US: `https://na4.docusign.net/restapi`.

## OpenAPI EU-SES Setup

DPA signed, integration tested end-to-end, active for EU market.

1. Create account at console.openapi.com
2. Navigate to API → eSignature → enable the `EU-SES` scope
3. Generate API tokens: create both a **Playground Sandbox** token and a **Production** token
4. Set Vercel env vars: `OPENAPI_API_KEY` (the hex-format token), `OPENAPI_CALLBACK_URL`, `OPENAPI_SANDBOX=true` (for testing)
5. Redeploy Vercel manually after setting env vars
6. Test with a Cal.com booking — check Vercel function logs for `E-sign sent via openapi: <requestId>`
7. Once confirmed working, remove `OPENAPI_SANDBOX` (or set to `false`) and update `OPENAPI_API_KEY` to the production token
8. Redeploy again

**Caveats / Gotchas**:

- **Token types differ**: The hex-format "Playground" tokens (e.g., `69a867a1...`) are NOT the same as the account-level tokens shown in settings. Use the Playground tokens from the API console.
- **Tokens expire**: Playground tokens have a fixed expiration date shown in the console. Renew before expiry or API calls will return `Wrong Token` (error 125.22).
- **Sandbox doesn't send emails**: The sandbox (`test.esignature.openapi.com`) does NOT send signing emails. The signing URL is returned in the API response at `data.signers[0].url` — open it directly to test.
- **Page indexing is 1-based**: `page: 1` = first page. `page: 6` = last page of a 6-page PDF. `page: -1` does NOT work for EU-SES (causes zero-byte PDF load failure). Only QES supports `page: -1`.
- **`authentication` is a STRING, not an array**: Use `"email"` or `"sms"`, not `["email"]`. The API internally converts to array.
- **Response wrapping**: API responses are wrapped in `{ data: { ... }, success: true }`. Unwrap with `json.data || json`.
- **`completeUrl`/`cancelUrl` go in `options.ui`**, NOT in `options` root. Placing them at root causes a 422 error: `invalid options property completeUrl`.
- **Callback `state` not `status`**: OpenAPI sends `state` field (e.g., `COMPLETED`, `WAIT_SIGNERS`), not `status`. The callback payload is wrapped in the `data` field as configured in `callback.field`.
- **Coordinate system**: Signature placement uses points from the top-left origin. Use pdfplumber or similar to find exact coordinates of your signature line.

**Key findings from T&C review (19 pages)**:
- OpenAPI is Italian (Rome), uses Google Cloud (SOC 1/2 Type II)
- TSP is Namirial (eIDAS-accredited, AgID-supervised)
- Signed docs stored 3 months, audit trails 10 years (Art. 12.11)
- Governed by Italian law, Court of Rome jurisdiction (Art. 18)
- DPA (Art. 28 DSGVO) signed via console — covers health data (Art. 9)

**Legal assessment**:
- Italy (EU) hosting is legally fine under GDPR — no requirement for German data center
- For Heilpraktiker contracts (BGB service agreements), SES is sufficient — QES not required
- The audit trail (10-year retention) captures signer identity, timestamp, IP, and OTP verification — sufficient evidence for BGB contract formation

## E-Signature Provider Comparison

| | OpenAPI EU-SES | DocuSign |
|---|---|---|
| **Cost** | €0.49/signature prepaid + €0.15 OTP (no annual commitment) | ~€50/month (API plan, $600/yr) |
| **Data location** | EU (Italy, Google Cloud, DPA signed) | Configurable (EU/US) |
| **eIDAS level** | SES with email/SMS OTP | SES/AES/QES |
| **DSGVO** | DPA in place, EU-only processing confirmed | AVV available |
| **API** | REST, real-time signing URLs | REST, mature, email-based |
| **Best for** | EU market (active) | US market (feature-flagged) |

**Strategy**: OpenAPI EU-SES is the active provider for the EU market. DPA is signed and EU data residency confirmed. DocuSign is feature-flagged via `ESIGN_PROVIDER` env var for potential US market use (but at $600/yr for API access, may not be worth it for low volume). Switching is a one-line env var change.

## Dual Market Strategy

| | DE/EU Market | US Market |
|---|---|---|
| **Page** | `index.html` | `coaching.html` (placeholder) |
| **Route** | `/` | `/coaching` |
| **Framing** | Psychotherapie / Psychologische Beratung | Psychoanalytic Coaching |
| **Price** | €150 | $150 |
| **E-sign** | OpenAPI EU-SES (active) | DocuSign US (or OpenAPI) |
| **Video** | RED Medical (DSGVO) | Doxy.me or RED Medical |
| **Legal** | Heilpraktikergesetz, DSGVO, eIDAS | No HIPAA (private pay), CCPA notice |
| **Cal.com** | `rozek.therapy/session` | Separate event type (USD) |

## Bugs Encountered & Fixed

### 1. Cal.com `language` field is an object, not a string
**Error**: `locale.startsWith is not a function`
**Fix**: Normalize language/locale field — check `typeof` before calling string methods. Cal.com sends `language` as an object with nested `.locale` property.

### 2. DocuSign `pageNumber` must be integer
**Error**: `Integer value expected for parameter: 'pageNumber'`
**Fix**: Changed from `'last'` to `'6'` (combined PDF is 6 pages after regeneration). DocuSign doesn't support `'last'` keyword.

### 3. DocuSign `user_not_found` auth error
**Error**: `invalid_grant: user_not_found`
**Cause**: Used the RSA Keypair ID instead of the actual User ID for `DOCUSIGN_USER_ID`.
**Fix**: Get the correct User ID from the top of the Apps and Keys page under "My Account Information".

### 4. Webhook signature verification crash
**Error**: `ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH` — `timingSafeEqual` requires same-length buffers
**Cause**: Two issues: (a) Cal.com prefixes the signature header with `sha256=`, making it longer than the computed hex digest. (b) When no secret is configured, Cal.com sends `x-cal-signature-256: no-secret-provided`.
**Fix**: Strip `sha256=` prefix before comparison, add length guard before `timingSafeEqual`, and set the webhook secret in both Vercel AND Cal.com (Settings → Developer → Webhooks → edit → Secret).

### 5. Vercel env vars don't trigger redeploy
**Symptom**: Code deployed but functions use stale/missing env vars.
**Fix**: Always manually redeploy after changing env vars in Vercel dashboard.

### 6. Git HEAD.lock stale file
**Error**: `cannot lock ref 'HEAD': Unable to create HEAD.lock: File exists`
**Fix**: `rm -f .git/HEAD.lock` — caused by interrupted git operations.

### 7. OpenAPI "Wrong Token" error
**Error**: `Wrong Token` (error code 125.22)
**Cause**: Used account-level token (`c2kbx...` format) instead of the Playground API token (hex format like `69a867a1...`). These are different token types in the OpenAPI console.
**Fix**: Use the "Playground Sandbox" or "Playground" token from console.openapi.com → API → eSignature, not the account token from settings.

### 8. OpenAPI 422: `invalid options property completeUrl`
**Error**: `422 — invalid options property completeUrl`
**Cause**: `completeUrl` and `cancelUrl` were placed in `options` root instead of `options.ui`.
**Fix**: Move both URLs inside `options.ui.completeUrl` and `options.ui.cancelUrl`.

### 9. OpenAPI `requestId: undefined` in logs
**Symptom**: Webhook logs show `E-sign sent via openapi: undefined`
**Cause**: OpenAPI wraps API responses in `{ data: { ... }, success: true }`. Code was reading `json.id` instead of `json.data.id`.
**Fix**: Unwrap response: `const data = json.data || json`.

### 10. OpenAPI callback fields undefined
**Symptom**: Callback logs show `Request undefined: undefined`
**Cause**: OpenAPI uses `state` (not `status`) and wraps callback payload in the `data` field (configured via `callback.field` in the API request).
**Fix**: Extract via `payload.data || payload`, then read `inner.state` and `inner.id`.

### 11. OpenAPI sandbox doesn't send emails
**Symptom**: No signing email received after successful API call (200 response).
**Cause**: The sandbox environment (`test.esignature.openapi.com`) does not send actual emails.
**Workaround**: Use the signing URL from the API response (`data.signers[0].url`) directly in a browser. In production, emails are sent normally.

### 12. OpenAPI `page: -1` causes zero-byte PDF
**Symptom**: Signing UI loads but PDF shows as zero bytes / fails to render.
**Cause**: `page: -1` (last page shorthand) only works for QES, not EU-SES. The API silently fails.
**Fix**: Use the explicit 1-based page number (e.g., `page: 6` for the last page of a 6-page PDF).

## TODO / Remaining Work

### Done

- [x] ~~Re-enable webhook signature verification~~ — Fixed: strip `sha256=` prefix, length guard, secret set in both Vercel + Cal.com
- [x] ~~Await OpenAPI response on data residency~~ — DPA signed, EU processing confirmed
- [x] ~~Update privacy-agreement-en.pdf~~ — Regenerated combined PDFs, removed old provider references

### Domain Migration: `robertrozek.de` → Vercel + Registrar Transfer

Two-phase process: (1) point DNS to Vercel while domain stays at all-inkl, (2) transfer domain to cheaper registrar. Never change two things at once.

**Current DNS state** (captured 2026-03-04):
```
A       → 85.13.157.92       (all-inkl web server, parked/423 Locked)
MX      → 10 w01d4968.kasserver.com  (⚠️ EMAIL IS ACTIVE at all-inkl)
TXT     → "v=spf1 a mx include:spf.kasserver.com ~all"  (SPF for all-inkl mail)
NS      → ns5.kasserver.com, ns6.kasserver.com
www     → 85.13.157.92       (same as apex)
AAAA    → (none)
```

---

**PHASE 0 — Pre-flight checks (5 min, do before touching anything)**

- [ ] **0a.** Open `https://praxis-site-vert.vercel.app` in your browser. Confirm it loads. This is your safety net — it keeps working no matter what happens with `robertrozek.de`.
- [ ] **0b.** Screenshot the DNS records above (or save this README section). You'll need them to rollback if anything breaks.
- [ ] **0c.** Decide: do you actually use email at `robertrozek.de`? If yes, you need to migrate email BEFORE Phase 2 (transferring away from all-inkl kills all-inkl email). If no, you can ignore all MX-related steps.
- [ ] **0d.** Open KAS: go to https://kas.all-inkl.com and log in. Confirm you can access the DNS settings for `robertrozek.de` (left menu → Tools → DNS settings, or Domain → robertrozek.de → DNS). If you can't find DNS settings, all-inkl may require a higher plan — check this now, not later.

---

**PHASE 1 — Point DNS to Vercel (keep domain at all-inkl)**

Do steps 1a–1e first (code + Vercel setup), then 1f (DNS change), then wait and verify. Total: ~30 min work + 5–30 min DNS propagation wait.

**1a. Code changes — I'll do this for you, just say "go"**

Search-replace `praxis-site-vert.vercel.app` → `robertrozek.de` in all files. The exact files:
- [ ] `public/index.html` line 9 — `<link rel="canonical">`
- [ ] `public/variant-doctolib.html` line 9 — `<link rel="canonical">`
- [ ] `public/variant-redmedical.html` line 9 — `<link rel="canonical">`
- [ ] `.env.example` lines 8 and 22
- [ ] `README.md` — ~6 places in documentation
- [ ] `CALCOM-WORKFLOW-SETUP.md` — 2 PDF URLs
- [ ] `SITE-AUDIT.md` — 1 reference
- [ ] `MARKET-ENTRY-STRATEGY.md` — 1 reference

After I do the replace, you commit and push:
```bash
git add -A && git commit -m "chore: update canonical URLs to robertrozek.de" && git push
```

**1b. Tell Vercel about the new domain**

- [ ] Open https://vercel.com → your project (praxis-site) → **Settings** (top nav) → **Domains** (left sidebar)
- [ ] In the text field, type `robertrozek.de` and click **Add**
- [ ] Vercel shows a page saying "DNS records needed". It will say something like:
  ```
  A Record → 76.76.21.21
  ```
  You don't need to do anything here yet — just confirm it shows this. Click **OK** or close the modal.
- [ ] Now type `www.robertrozek.de` in the same field and click **Add**
- [ ] Vercel will ask how to configure `www`. Choose: **Redirect to robertrozek.de** (this makes the non-www version the canonical URL)
- [ ] Both domains should now appear in the list, with yellow/orange "Invalid Configuration" badges. That's expected — you haven't changed DNS yet.

**1c. Update Vercel environment variables**

- [ ] Stay in Vercel → **Settings** → **Environment Variables**
- [ ] Find `SITE_URL`. Click the three dots (⋯) → **Edit**. Change the value from `https://praxis-site-vert.vercel.app` to:
  ```
  https://robertrozek.de
  ```
  Click **Save**.
- [ ] Find `OPENAPI_CALLBACK_URL`. Edit it to:
  ```
  https://robertrozek.de/api/esign-callback
  ```
  Click **Save**.
- [ ] Now trigger a redeploy: go to **Deployments** tab (top nav) → find the latest deployment → click the three dots (⋯) on the right → **Redeploy** → confirm. Wait for it to finish (~30 sec).

**1d. Change DNS at all-inkl (the actual switch)**

- [ ] Open https://kas.all-inkl.com → log in
- [ ] Navigate to DNS settings for `robertrozek.de`:
  - Try: left sidebar → **Tools** → **DNS-Einstellungen** (DNS settings)
  - Or: **Domain** → click `robertrozek.de` → **DNS**
  - If you see a list of records (A, MX, CNAME, TXT, etc.), you're in the right place
- [ ] Find the **A record** for `robertrozek.de` (the one pointing to `85.13.157.92`). Click edit (pencil icon or similar). Change the value to:
  ```
  76.76.21.21
  ```
  Save.
- [ ] Find the **www** record (may be an A record pointing to `85.13.157.92`, or a CNAME). Change it to a **CNAME** pointing to:
  ```
  cname.vercel-dns.com
  ```
  Save. (If all-inkl won't let you change A to CNAME for `www`, just change the A record value to `76.76.21.21` instead — that also works.)
- [ ] **DO NOT touch any of these records:**
  - MX record (`w01d4968.kasserver.com`) — this is your email
  - TXT record (`v=spf1...`) — this is your email's spam protection
  - NS records — never touch these manually
- [ ] Double-check: you should now have:
  ```
  A       robertrozek.de     → 76.76.21.21          ← CHANGED
  CNAME   www                → cname.vercel-dns.com  ← CHANGED
  MX      robertrozek.de     → w01d4968.kasserver.com ← UNTOUCHED
  TXT     robertrozek.de     → v=spf1...             ← UNTOUCHED
  ```

**1e. Wait for DNS propagation (5–30 min, sometimes up to 48h)**

- [ ] Open https://dnschecker.org/#A/robertrozek.de — refresh every few minutes
- [ ] When most/all locations show `76.76.21.21` instead of `85.13.157.92`, propagation is done
- [ ] Go back to Vercel → **Settings** → **Domains**. The yellow badges should turn to green checkmarks. Vercel automatically provisions an SSL certificate once it can see the DNS pointing to it.
- [ ] If after 30 min Vercel still shows "Invalid Configuration": click **Refresh** on the domain. Sometimes it takes a manual check.

**1f. Verify — the moment of truth**

- [ ] Open `https://robertrozek.de` in your browser (try incognito/private window to avoid cache)
  - ✅ Should show your practice website
  - ✅ Should have a padlock icon (valid SSL)
  - ❌ If you see the all-inkl parking page: DNS hasn't propagated yet, wait longer
  - ❌ If you see a certificate error: Vercel hasn't issued SSL yet, wait 5–10 min
- [ ] Open `https://www.robertrozek.de` — should automatically redirect to `https://robertrozek.de`
- [ ] Open `https://praxis-site-vert.vercel.app` — should still work (Vercel keeps old domains active)
- [ ] If you use email at `robertrozek.de`: send a test email to that address from a different account. Confirm it arrives.

**1g. Update Cal.com webhook URL**

- [ ] Open https://app.cal.com → **Settings** (gear icon, bottom left) → **Developer** → **Webhooks**
- [ ] Click on your existing webhook (the one firing `BOOKING_CREATED`)
- [ ] Change the **Subscriber URL** from:
  `https://praxis-site-vert.vercel.app/api/webhook-booking`
  to:
  ```
  https://robertrozek.de/api/webhook-booking
  ```
- [ ] The **Secret** stays the same — don't change it
- [ ] Click **Save**

**1h. Update OpenAPI callback (if registered in console)**

- [ ] Open https://console.openapi.com → check if there's a callback URL registered anywhere for the eSignature API
- [ ] If yes, update it to `https://robertrozek.de/api/esign-callback`
- [ ] If there's no separate callback URL field (because it's sent per-request in the API body), skip this — the Vercel env var change in step 1c already handles it

**1i. Update Google Analytics**

- [ ] Open https://analytics.google.com → **Admin** (gear icon, bottom left)
- [ ] Under your property, click **Data Streams** → click your web stream
- [ ] Click **Edit** (pencil icon) next to the stream URL
- [ ] Change from `praxis-site-vert.vercel.app` to `robertrozek.de`
- [ ] Save

**1j. Update Microsoft Clarity**

- [ ] Open https://clarity.microsoft.com → your project → **Settings**
- [ ] Update the **Site URL** to `https://robertrozek.de`
- [ ] Save

**1k. Add to Google Search Console**

- [ ] Open https://search.google.com/search-console
- [ ] Click the dropdown at the top left → **Add property**
- [ ] Choose **Domain** → type `robertrozek.de` → click **Continue**
- [ ] Google will ask you to verify ownership via a **DNS TXT record**. It will give you a string like `google-site-verification=abc123...`
- [ ] Go back to KAS → DNS settings for `robertrozek.de` → **Add** a new TXT record:
  - Name/Host: `robertrozek.de` (or `@` or blank, depending on what KAS shows)
  - Value: paste the `google-site-verification=...` string Google gave you
  - Save
- [ ] Go back to Google Search Console → click **Verify**. May take a few minutes for the TXT record to propagate.
- [ ] Once verified, go to **Sitemaps** in the left menu → submit `https://robertrozek.de/sitemap.xml` (if you have one; if not, skip — Google will crawl the site automatically)

**1l. End-to-end test**

- [ ] Make a test booking on Cal.com (use the new `robertrozek.de` site or book directly on Cal.com)
- [ ] Check Vercel function logs: Deployments → latest → **Functions** tab → look for `webhook-booking` → confirm it shows a 200 response with the new domain
- [ ] Confirm OpenAPI e-sign request fires (look for `E-sign sent via openapi: <id>` in logs)
- [ ] If in sandbox: open the signing URL from the logs and confirm the document loads

**✅ Phase 1 complete. Stop here. Use the site for at least 3–5 days to make sure everything is stable before Phase 2.**

---

**PHASE 2 — Transfer domain to cheaper registrar (saves ~€12–15/yr)**

Only do this after Phase 1 has been stable for several days. Recommended: **Cloudflare Registrar** (at-cost pricing, ~€5–8/yr, excellent DNS management, free email routing).

**2a. If you use email at `robertrozek.de` — migrate email FIRST**

⚠️ Transferring the domain away from all-inkl kills all-inkl email hosting. You must set up a replacement BEFORE transferring.

- [ ] Simplest option: **Cloudflare Email Routing** (free). This forwards all email from `@robertrozek.de` to `rozek.therapy@pm.me` (or any address you choose). No mailbox needed, no cost.
- [ ] You'll set this up after the domain is at Cloudflare (step 2f). But be aware: there will be a brief period during/after transfer where email may be disrupted. Warn anyone who emails you at that address.
- [ ] Alternative if you need a real mailbox: Migadu (~€19/yr), Zoho (free tier for 1 user), or Proton Mail custom domain ($48/yr).

**2b. Create Cloudflare account**

- [ ] Go to https://dash.cloudflare.com/sign-up → create a free account
- [ ] Once logged in, you'll see the Cloudflare dashboard

**2c. Unlock the domain at all-inkl**

- [ ] Log into KAS (https://kas.all-inkl.com)
- [ ] Go to **Domain** in the left sidebar → click on `robertrozek.de`
- [ ] Look for **Domainsperre** (transfer lock). If it's enabled (Gesperrt), click to **disable** it (Entsperren). Confirm.
- [ ] Look for **AuthInfo-Code** — some all-inkl plans show this, some don't. `.de` domains use a DENIC **Providerwechsel** (provider change) process which does NOT always require an auth-code like `.com` domains do.
  - If KAS shows an AuthInfo field: request it and save it. You may need it at the new registrar.
  - If KAS does NOT show an AuthInfo field: that's normal for `.de`. The new registrar initiates the transfer with DENIC directly, and all-inkl releases the domain as long as the Domainsperre is disabled.

**2d. Initiate transfer at Cloudflare**

- [ ] In Cloudflare dashboard → left sidebar → **Domain Registration** → **Transfer Domains**
- [ ] Type `robertrozek.de` → click **Confirm**
- [ ] Cloudflare will check if the domain is transferable. If it says "locked", go back to KAS and make sure you disabled the Domainsperre (step 2c).
- [ ] If Cloudflare asks for an auth-code: enter the one from step 2c (if you got one). If you didn't get one, try submitting without it — for `.de` DENIC transfers, it may not be required.
- [ ] Cloudflare will show the transfer price (at-cost, usually ~€5–8 for `.de`)
- [ ] Confirm and pay. The transfer is now pending.

**2e. Wait for transfer to complete**

- [ ] DENIC processes `.de` provider changes (Providerwechsel) in 1–5 business days
- [ ] You may get a confirmation email from DENIC or all-inkl — **approve** the transfer if asked. all-inkl may also send a "do you want to keep the domain?" email — do NOT click "keep", let it proceed.
- [ ] Cloudflare will show the transfer status in **Domain Registration** → **Transfer Domains**
- [ ] During the transfer, your DNS still works at all-inkl — no downtime

**2f. Set up DNS at Cloudflare (once transfer completes)**

- [ ] Cloudflare dashboard → click `robertrozek.de` → **DNS** → **Records**
- [ ] Cloudflare may have imported your old records. Check what's there. You need:
  ```
  Type    Name              Content                         Proxy
  A       robertrozek.de    76.76.21.21                     DNS only (grey cloud)
  CNAME   www               cname.vercel-dns.com            DNS only (grey cloud)
  ```
- [ ] ⚠️ **IMPORTANT**: Set the proxy toggle to **"DNS only"** (grey cloud icon), NOT "Proxied" (orange cloud). Vercel needs direct DNS — Cloudflare proxy breaks Vercel's SSL.
- [ ] If the old MX record was imported (`w01d4968.kasserver.com`): **delete it** — all-inkl email no longer works after transfer
- [ ] If the old SPF TXT record was imported (`v=spf1 a mx include:spf.kasserver.com ~all`): **delete it** — no longer relevant

**2g. Set up email forwarding at Cloudflare (if you use email)**

- [ ] Cloudflare dashboard → `robertrozek.de` → **Email** → **Email Routing**
- [ ] Click **Get Started** or **Enable Email Routing**
- [ ] Cloudflare will add the required MX and TXT records automatically
- [ ] Click **Add destination address** → enter `rozek.therapy@pm.me` (or whichever address you want to forward to)
- [ ] Cloudflare sends a verification email to that address — click the link in it to confirm
- [ ] Once verified, set up a **Catch-all rule**: Route `*@robertrozek.de` → forward to `rozek.therapy@pm.me`
- [ ] Click **Save**
- [ ] Test: send an email to `anything@robertrozek.de` from a different account → should arrive at `rozek.therapy@pm.me`

**2h. Final verification**

- [ ] Open `https://robertrozek.de` — site loads with SSL ✅
- [ ] Open `https://www.robertrozek.de` — redirects to non-www ✅
- [ ] Send email to your `@robertrozek.de` address — arrives at forwarding destination ✅
- [ ] Make a test Cal.com booking → webhook fires → e-sign works ✅
- [ ] Cloudflare dashboard shows domain as **Active** ✅

**2i. Clean up**

- [ ] Don't renew at all-inkl when renewal comes due
- [ ] If you had any other services at all-inkl (hosting, FTP, databases), cancel those too
- [ ] Optionally: set up **auto-renew** at Cloudflare so you never forget (Domain Registration → `robertrozek.de` → Auto-Renew toggle)

**✅ Phase 2 complete. Total annual cost: ~€5–8 (domain) + €0 (Vercel hosting) + €0 (Cloudflare email routing) = ~€5–8/yr total. Down from €20/yr.**

---

**If something goes wrong:**

| Problem | Fix |
|---|---|
| Site won't load after Phase 1 DNS change | Revert A record at KAS back to `85.13.157.92`. The old `praxis-site-vert.vercel.app` URL still works as fallback. |
| Vercel shows "Invalid Configuration" for domain | DNS hasn't propagated yet. Wait up to 48h. Check https://dnschecker.org/#A/robertrozek.de |
| SSL certificate error in browser | Vercel hasn't issued cert yet. Wait 10 min, then check Vercel → Settings → Domains. If stuck, remove and re-add the domain. |
| Email stops working after Phase 1 | You accidentally changed/deleted the MX record. Go to KAS → DNS → re-add: `MX 10 w01d4968.kasserver.com` |
| Email stops working after Phase 2 | Expected if you didn't set up Cloudflare Email Routing. Do step 2g. |
| Cal.com webhook returns 404 | You forgot to update the webhook URL in Cal.com (step 1g). Old URL still points to Vercel but the path is fine — likely a typo in the new URL. |
| OpenAPI e-sign fails after domain change | Check `OPENAPI_CALLBACK_URL` env var in Vercel matches `https://robertrozek.de/api/esign-callback` exactly. Redeploy after changing. |
| Cloudflare proxy breaks Vercel | You left the orange cloud (Proxied) on. Switch to grey cloud (DNS only) for both A and CNAME records. |
| Transfer stuck / rejected by DENIC | Transfer lock (Domainsperre) is still on at all-inkl, or you clicked "keep domain" in a confirmation email by mistake. Go to KAS → confirm Domainsperre is disabled. If all-inkl sent a retention email, contact their support to release it. |

### Other

- [ ] **Renew OpenAPI API tokens** — Playground tokens expire (check console.openapi.com). Wrong Token errors mean expired tokens.
- [ ] Switch OpenAPI from sandbox to production (`OPENAPI_SANDBOX=false`, update `OPENAPI_API_KEY` to production token, redeploy)
- [ ] Set Cal.com price back to €150 after testing
- [ ] Remove debug logging from api/esign-callback.js (`[Callback raw]` line) when stable
- [ ] Build out coaching.html for US market
- [ ] Create separate Cal.com event type for US coaching (USD pricing)
- [ ] Set up Doxy.me for US video sessions (or confirm RED Medical for all)
- [ ] Uncomment Google Ads tracking when campaign is created
- [ ] Rotate DocuSign RSA keypair if DocuSign is ever activated (private key was shared in chat during setup)
- [ ] Set up Cal.com Workflow for bilingual intake PDF links in booking confirmation emails (see CALCOM-WORKFLOW-SETUP.md)

## Decision Log

### 2026-03-04 — E-Signature: OpenAPI EU-SES (active) + DocuSign (feature-flagged)

**Decision**: Use OpenAPI EU-SES as the primary e-signature provider for the EU market. DocuSign remains feature-flagged via `ESIGN_PROVIDER` env var for potential US market use.

**Reasoning**: OpenAPI DPA signed, EU data residency confirmed. €0.49/signature prepaid vs DocuSign's $600/yr API plan. End-to-end tested in sandbox: Cal.com webhook → OpenAPI API → signing URL → callback → completion. DocuSign is overkill for a solo practice at current volume.

### 2026-03-04 — Single Signature Block with Pre-Embedded Therapist Signature

**Decision**: Consolidate all 4 intake documents into one 6-page PDF with a single client signature block on the last page. Therapist signature pre-embedded as text in Dancing Script font.

**Reasoning**: One signature covers all documents (treatment contract, informed consent, privacy agreement, telehealth consent). Cheaper (one API call per client). Date, name, and identity are captured by the OpenAPI audit trail (10-year retention), so no separate date/name fields needed in the PDF. Pre-embedding the therapist signature eliminates the need for a counter-signature step.

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

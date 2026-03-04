# Site Audit — Praxis Robert Rozek

**Date:** 2026-03-04  
**Auditor:** Automated audit  
**Scope:** All public pages, API endpoints, legal pages, configuration

---

## Critical Issues (Must Fix Before Go-Live)

### 1. Currency: CHF → EUR
**Files:** `public/index.html` (lines 115, 121, 1181)  
**Issue:** Currency displayed as "CHF" (Swiss Francs) but Cal.com/Stripe is configured for EUR (€150).  
**Impact:** Misleading pricing, potential legal issue under Preisangabenverordnung (PAngV).  
**Fix:**
- Line 1181: Change `<span class="pricing-currency">CHF</span>` → `<span class="pricing-currency">€</span>`
- Line 115: Change `currency: 'CHF'` → `currency: 'EUR'` in tracking code
- Line 121: Change `currency: 'CHF'` → `currency: 'EUR'` in commented-out Ads conversion

### 2. "Free Consultation" — No Free Event Type Exists
**Files:** `public/index.html` (lines 1066, 1175, 1185, 1190, 1198, 1266, 1270)  
**Issue:** Multiple references to a "free 30-minute initial consultation" but Cal.com only has one event type at €150. No free event type exists.  
**Impact:** False advertising. Clients click "Book free consultation" and are immediately asked to pay €150.  
**Options:**
- **Option A:** Create a separate free 30-min event type in Cal.com (recommended — standard practice)
- **Option B:** Remove all "free consultation" references and position the €150 session as the entry point
- **Option C:** Add a note that the first 30 minutes of the paid session serve as the consultation, refundable if not continuing  

**Affected text:**
- Hero CTA: "Book a free consultation →"
- Pricing description: "The initial consultation is free."
- Pricing note: "Initial 30-minute consultation is complimentary."
- Pricing list item: "Free 30-minute initial consultation"
- Pricing CTA: "Book free consultation →"
- Bottom CTA text: "Book a free 30-minute consultation..."
- Bottom CTA button: "Schedule free consultation →"

### 3. Session Duration Mismatch: 50 min vs 45 min
**File:** `public/index.html` (line 1184)  
**Issue:** Pricing shows "per session · 50 minutes" but the Cal.com event type was set to 45 minutes.  
**Fix:** Either update Cal.com to 50 minutes, or change the site to say 45 minutes.

### 4. Supervision Duration: 60 min But No Separate Event Type
**File:** `public/index.html` (line 1227)  
**Issue:** FAQ says supervision is "60-minute sessions" but no separate supervision event type exists in Cal.com.  
**Fix:** Create a separate Cal.com event type for supervision (60 min, €150) or change the text.

### 5. Webhook Signature Verification Disabled
**File:** `api/webhook-booking.js` (line 78)  
**Issue:** `if (false && process.env.CALCOM_WEBHOOK_SECRET)` — signature verification is disabled.  
**Impact:** Anyone can POST to `/api/webhook-booking` and trigger e-signature requests.  
**Fix:** Re-enable after confirming Cal.com's exact signature header format.

### 6. DocuSign Hardcoded to Demo Environment
**File:** `api/esign-provider.js` (line 92)  
**Issue:** OAuth token URL is hardcoded to `account-d.docusign.com` (demo). When switching to production, this must also change.  
**Fix:** Make the auth URL configurable via env var, or derive it from `DOCUSIGN_BASE_URL`.

### 7. Debug Logging in Production
**File:** `api/webhook-booking.js` (lines 68-74)  
**Issue:** Extensive `console.log` with header dumps and env var checks. Logs client emails in plaintext.  
**Impact:** PII in server logs, DSGVO concern.  
**Fix:** Remove or gate behind a `DEBUG` env var.

---

## Important Issues (Fix Soon)

### 8. Datenschutzerklärung Missing E-Signature Section
**File:** `public/datenschutz.html`  
**Issue:** No mention of DocuSign or OpenAPI processing client data (name, email, signature). These are data processors under Art. 28 DSGVO and must be disclosed.  
**Fix:** Add section covering:
- DocuSign Inc. (or OpenAPI S.r.l.) as data processor
- Data processed: name, email, signed documents
- Legal basis: Art. 6(1)(b) DSGVO (contract performance)
- Data transfer to US (DocuSign) or Italy (OpenAPI) with appropriate safeguards

### 9. Datenschutzerklärung Missing Google Fonts Disclosure
**File:** `public/datenschutz.html`  
**Issue:** The site loads Google Fonts via `fonts.googleapis.com`, which transmits the user's IP to Google servers. This must be disclosed under DSGVO (see LG München I, Az. 3 O 17493/20 — €100 damages per user for undisclosed Google Fonts loading).  
**Fix:** Either:
- Add a Google Fonts section to the privacy policy, OR
- Self-host the fonts (download and serve from Vercel — eliminates the issue entirely, also faster)

### 10. Datenschutzerklärung Missing Supervisory Authority
**File:** `public/datenschutz.html`  
**Issue:** Section 10 mentions the right to lodge a complaint but doesn't name the competent authority.  
**Fix:** Add: "Zuständige Aufsichtsbehörde: Bayerisches Landesamt für Datenschutzaufsicht (BayLDA), Promenade 18, 91522 Ansbach, www.lda.bayern.de"

### 11. Datenschutzerklärung Missing US Data Transfer Information
**File:** `public/datenschutz.html`  
**Issue:** Vercel (US), Stripe (US), Google (US), Microsoft (US) all process data. The privacy policy should address transatlantic data transfers and the legal basis (EU-US Data Privacy Framework, SCCs).  
**Fix:** Add a "Data transfers to third countries" section.

### 12. Impressum: Missing Phone or Fax
**File:** `public/impressum.html`  
**Issue:** § 5 TMG requires means of "schnelle elektronische Kontaktaufnahme und unmittelbarer Kommunikation" — interpreted by courts to require at least two contact methods. Email alone may not suffice.  
**Fix:** Add a phone number, or add a contact form URL.

### 13. Page Language Mismatch
**File:** `public/index.html` (line 2)  
**Issue:** `<html lang="en">` but the page targets the DE/EU market. Mixed language content (English text, German legal references, German footer legal text).  
**Fix:** Either set `lang="de"` if primarily German-market, or keep `lang="en"` but ensure the cookie banner and legal notices are also available in German (DSGVO enforcement is in German).

### 14. Missing Security Headers
**File:** `vercel.json`  
**Issue:** Missing recommended security headers:
- `Content-Security-Policy` (protects against XSS)
- `Permissions-Policy` (restricts browser features)
- `Strict-Transport-Security` (HSTS)  
**Fix:** Add to `vercel.json` headers.

### 15. Canonical URL Points to Vercel Subdomain
**File:** `public/index.html` (line 9)  
**Issue:** `<link rel="canonical" href="https://praxis-site-vert.vercel.app/">` — should be the production domain when going live.
**Fix:** ✅ Updated to `https://robertrozek.de/` (2026-03-04).

---

## Minor Issues (Polish)

### 16. Cookie Banner Language
**File:** `public/index.html` (lines 1013-1016)  
**Issue:** Cookie banner text is in English. For DACH market, should be in German or bilingual.  
**Fix:** Add German translation or make bilingual.

### 17. "Zusatzversicherung" Reference
**File:** `public/index.html` (line 1217)  
**Issue:** Insurance FAQ mentions "Zusatzversicherung" but Heilpraktiker invoices via GebüH are also reimbursable by some Beihilfe programs and private full insurance (PKV), not just supplementary insurance.  
**Fix:** Broaden to: "Reimbursement depends on your insurance (private insurance / Zusatzversicherung für Heilpraktiker). Please check with your provider."

### 18. Missing `alt` Text / Accessibility
**File:** `public/index.html`  
**Issue:** No images on page (good for performance), but SVG icons in buttons lack `aria-label` or `role="img"`.  
**Fix:** Add `aria-hidden="true"` to decorative SVGs, or `role="img" aria-label="..."` for meaningful ones.

### 19. privacy-agreement-en.pdf Stale References
**File:** `public/docs/privacy-agreement-en.pdf`  
**Issue:** Still references "It's Complicated, Doctolib, or RED Medical" per README TODO.  
**Fix:** Regenerate PDF with updated provider list (only RED Medical + DocuSign/OpenAPI).

### 20. Cal.com Price Still at Test Value
**Issue:** Cal.com event type price may still be at €0.50 (test) instead of €150 (production).  
**Fix:** Set back to €150 before going live.

### 21. No favicon
**File:** `public/index.html`  
**Issue:** No `<link rel="icon">` tag. Browser shows default icon.  
**Fix:** Add a favicon (simple monogram or minimal design matching the stone/warm palette).

### 22. No Open Graph Image
**File:** `public/index.html`  
**Issue:** `og:image` meta tag is missing. Social media shares will show no preview image.  
**Fix:** Create an OG image (1200x630px) and add `<meta property="og:image" content="...">`.

---

## Summary

| Priority | Count | Examples |
|----------|-------|---------|
| **Critical** | 7 | CHF→EUR, free consultation lie, webhook security |
| **Important** | 8 | Missing privacy disclosures, security headers |
| **Minor** | 7 | Favicon, cookie banner language, accessibility |

### Recommended Fix Order
1. Fix CHF → EUR (5 minutes, high impact)
2. Decide on free consultation strategy (requires Cal.com config)
3. Fix session duration mismatch (Cal.com or site)
4. Update Datenschutzerklärung (add e-sign, Google Fonts, supervisory authority, data transfers)
5. Add phone to Impressum
6. Self-host Google Fonts
7. Re-enable webhook signature verification
8. Remove debug logging
9. Add security headers
10. Create favicon and OG image

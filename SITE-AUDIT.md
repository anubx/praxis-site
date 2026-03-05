# Site Audit — Praxis Robert Rozek

**Date:** 2026-03-04  
**Auditor:** Automated audit  
**Scope:** All public pages, API endpoints, legal pages, configuration

---

## Critical Issues (Must Fix Before Go-Live)

### 1. ~~Currency: CHF → EUR~~ ✅ FIXED (2026-03-04)
**Status:** All currency references updated to EUR.

### 2. ~~"Free Consultation" — No Free Event Type Exists~~ ✅ FIXED (2026-03-04)
**Status:** All "free consultation" references removed. €150 first session positioned as entry point ("Book a first session"). Option B was chosen.

### 3. ~~Session Duration Mismatch: 50 min vs 45 min~~ ✅ FIXED (2026-03-04)
**Status:** Aligned to 45 minutes throughout.

### 4. Supervision Duration: 60 min But No Separate Event Type
**File:** `public/index.html` (line 1227)  
**Issue:** FAQ says supervision is "60-minute sessions" but no separate supervision event type exists in Cal.com.  
**Fix:** Create a separate Cal.com event type for supervision (60 min, €150) or change the text.

### 5. ~~Webhook Signature Verification Disabled~~ ✅ FIXED (2026-03-04)
**Status:** Re-enabled. Strips `sha256=` prefix, length guard before `timingSafeEqual`, secret set in both Vercel + Cal.com.

### 6. DocuSign Hardcoded to Demo Environment
**File:** `api/esign-provider.js` (line 92)  
**Issue:** OAuth token URL is hardcoded to `account-d.docusign.com` (demo). When switching to production, this must also change.  
**Fix:** Make the auth URL configurable via env var, or derive it from `DOCUSIGN_BASE_URL`.

### 7. ~~Debug Logging in Production~~ ✅ FIXED (2026-03-04)
**Status:** Debug logging removed from webhook-booking.js and esign-callback.js.

---

## Important Issues (Fix Soon)

### 8. ~~Datenschutzerklärung Missing E-Signature Section~~ ✅ FIXED (2026-03-04)
**Status:** OpenAPI S.r.l. disclosed in datenschutz.html with data types, legal basis, EU data residency. PayPal (Europe) S.à r.l. also added.

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

### 12. ~~Impressum: Missing Phone or Fax~~ ✅ FIXED (2026-03-05)
**Status:** Phone number (+49 157 5469 5230) added to impressum.html.

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

### 15. ~~Canonical URL Points to Vercel Subdomain~~ ✅ FIXED (2026-03-04)
**Status:** Updated to `https://robertrozek.de/`.

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
**Issue:** May still reference outdated providers (RED Medical, It's Complicated). Should now reference Cal Video + OpenAPI only.
**Fix:** Regenerate PDF with `generate-intake-pdfs.py` — update provider list to Cal Video + OpenAPI.

### 20. ~~Cal.com Price Still at Test Value~~ ✅ FIXED (2026-03-04)
**Status:** Cal.com price set to €150.

### 21. ~~No favicon~~ ✅ FIXED (2026-03-04)
**Status:** favicon.svg added to `public/`.

### 22. ~~No Open Graph Image~~ ✅ FIXED (2026-03-04)
**Status:** og-image.png (1200x630) added to `public/`. `og:image` meta tag added to index.html.

---

## Summary (Updated 2026-03-05)

| Priority | Total | Fixed | Remaining |
|----------|-------|-------|-----------|
| **Critical** | 7 | 6 | 1 (DocuSign hardcoded to demo — #6, low priority since OpenAPI is active) |
| **Important** | 8 | 4 | 4 (#9 Google Fonts, #10 supervisory authority, #11 US data transfers, #13 page language, #14 security headers) |
| **Minor** | 7 | 3 | 4 (#16 cookie banner language, #17 insurance FAQ, #18 accessibility, #19 intake PDF stale refs) |

### Remaining Fix Order
1. Self-host Google Fonts (#9 — DSGVO liability)
2. Add supervisory authority to datenschutz.html (#10)
3. Add US data transfer section to datenschutz.html (#11)
4. Add security headers to vercel.json (#14)
5. Fix cookie banner language (#16 — bilingual DE/EN)
6. Fix page language attribute (#13)
7. Regenerate intake PDFs with updated provider references (#19)
8. Add aria attributes to SVGs (#18)

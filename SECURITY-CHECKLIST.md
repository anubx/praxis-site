# Security Checklist — robertrozek.de

Last reviewed: 2026-03-05

---

## Current Security Posture

Static HTML site on Vercel with 4 serverless API endpoints. No database, no user accounts, no CMS. Attack surface is minimal.

### Headers (vercel.json) — all deployed ✅

- [x] `Strict-Transport-Security` with preload (63072000s / 2 years)
- [x] `X-Frame-Options: DENY` (prevents clickjacking)
- [x] `X-Content-Type-Options: nosniff`
- [x] `Referrer-Policy: strict-origin-when-cross-origin`
- [x] `Permissions-Policy` blocking camera, mic, geolocation, FLoC
- [x] `Content-Security-Policy` whitelisting only Cal.com, GTM, Clarity

### Webhook Security — partially done

- [x] HMAC-SHA256 signature verification on `/api/webhook-booking`
- [x] HMAC-SHA256 signature verification on `/api/webhook-cancellation`
- [x] `crypto.timingSafeEqual` used (prevents timing attacks)
- [x] POST-only enforcement on all API routes

---

## TODO — Action Items

### Critical

- [ ] **Always set `CALCOM_WEBHOOK_SECRET` in Vercel env vars.**
  Both webhook handlers skip signature verification entirely when this var is unset. Without it, anyone can POST fake bookings → trigger emails, trigger Stripe refunds.
  Priority: **before going live with webhooks**

### Medium

- [ ] **Add authentication to `/api/esign-callback`.**
  Currently has zero verification — no shared secret, no signature check. Right now it only logs events so damage is zero, but if you ever extend it (auto-download signed docs, CRM updates, email notifications), add verification first.
  Options: shared secret header, IP allowlist (OpenAPI IPs), or webhook signature.

- [ ] **Sanitize `name` field in email templates.**
  The attendee `name` from Cal.com is inserted raw into HTML emails (`<p>Dear ${name},</p>`). A malicious booking with HTML in the name field could render clickable phishing links in receipt/signing emails. Email clients strip `<script>` tags but not `<a>` tags.
  Fix: escape `<`, `>`, `&`, `"` before inserting into HTML.

- [ ] **Submit to HSTS preload list.**
  The `Strict-Transport-Security` header includes `preload` but this only works if the domain is registered at [hstspreload.org](https://hstspreload.org). Submit `robertrozek.de` there.

### Low

- [ ] **`/returning.html` is unlisted but not access-controlled.**
  Blocked from search engines via `robots.txt` + `noindex`, but anyone with the URL can see the €70 rate. This is by design (shared via direct link to returning clients), but be aware it's not password-protected.

- [ ] **`/api/generate-receipt` module exposure.**
  Verify that `generate-receipt.js` is not auto-exposed as an HTTP route by Vercel. It exports a function (not a handler), so it should be fine — but worth confirming it returns 404 when hit directly.

- [ ] **Rate limiting on API endpoints.**
  Vercel serverless functions have no built-in rate limiting. A determined attacker could spam the webhook endpoints. For a solo practice with low traffic this is unlikely, but Vercel's `vercel.json` doesn't support rate limiting natively. Options: Vercel WAF (Pro plan), or add simple in-memory rate limiting in the handlers.

- [ ] **Subresource Integrity (SRI) for external scripts.**
  If you ever add external JS libraries loaded from CDN, add `integrity` attributes. Currently not applicable (Cal.com embed doesn't support SRI).

---

## Things That Are Already Secure

- No database → nothing to SQL-inject
- No user accounts → no credentials to steal
- No cookies set → no session hijacking
- No file uploads → no upload exploits
- No CMS/admin panel → no brute-force target
- Stripe/SMTP secrets in Vercel env vars, not in source code
- CSP prevents third-party script injection
- Vercel handles TLS termination, DDoS, edge caching
- `robots.txt` + `noindex` on sensitive pages (/returning)

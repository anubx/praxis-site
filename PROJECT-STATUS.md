# Project Status — 2026-03-05 (Updated)

## Overall Completeness: 100% for Phase 1 Go-Live ✅

The core product is fully functional and all pre-launch requirements are met. End-to-end test completed successfully on 2026-03-05: booking → payment → receipt PDF → e-signature → video link → cancellation — all working. Cal.com DPA countersignature still pending but does not block operations.

---

## What's Done (Working)

| Component | Status | Notes |
|---|---|---|
| **Landing page** | ✅ Live | `robertrozek.de`, inline Cal.com embed, psychotherapy branding, responsive |
| **Booking flow** | ✅ Working | Cal.com → Stripe €150 → BOOKING_CREATED webhook |
| **E-signature** | ✅ Working | OpenAPI EU-SES, DPA signed, production tokens |
| **Payment receipt** | ✅ Built | Zahlungsbestätigung PDF auto-sent per booking via SMTP |
| **Monthly invoices** | ✅ Built | `tools/generate-rechnung.py` with GebüH codes, sequential numbering |
| **Cancellation webhook** | ✅ Built | Late cancellation detection, email notification |
| **Signing email** | ✅ Working | Branded HTML email with signing URL via all-inkl SMTP |
| **Privacy policy** | ✅ Updated | OpenAPI, Stripe, Cal.com, PayPal, Cal Video disclosed |
| **Impressum** | ✅ Updated | Phone number, Steuernummer, full legal info |
| **Intake documents** | ✅ Generated | DE + EN combined PDFs, 6 pages each |
| **Domain + SSL** | ✅ Live | `robertrozek.de` on Vercel with auto-SSL |
| **Analytics** | ✅ Active | GA4 + Microsoft Clarity |
| **Favicon + OG image** | ✅ Added | Social sharing works |
| **Legal compliance** | ✅ Core | HeilprG designation, §4 UStG exemption, §203 StGB acknowledged |
| **Decision documentation** | ✅ Comprehensive | README.md has full decision log, bug log, architecture notes |
| **Stripe customer emails** | ✅ Enabled | Successful payments + Refunds toggled on |
| **Email deliverability** | ✅ Configured | SPF + DKIM (2 keys) + DMARC at all-inkl; stale Mailjet records removed |
| **DPAs (6/7)** | ✅ Signed | OpenAPI, all-inkl, Stripe, Vercel, GA4, Clarity — all in `/dpa` folder |

## What's Remaining (Priority Order)

### ~~Must-Do Before First Real Client~~ — ALL DONE

1. ~~**End-to-end test**~~ — ✅ Completed 2026-03-05. Booking, receipt PDF, e-signature, video link, cancellation all verified working.

### Waiting on External (No Action Needed)

2. **Cal.com DPA countersignature** — Requested 2x (2026-03-04 + 2026-03-05), pending from Bailey Pumfleet. Nothing to do but wait.

### Should-Do Soon

3. **Self-host Google Fonts** — Eliminates DSGVO liability (LG München I ruling)
4. **Security headers** — CSP, HSTS, Permissions-Policy in vercel.json
5. **Google Search Console** — Request re-indexing (old "Psychoanalytic Practice" text cached)
6. **Privacy policy additions** — Supervisory authority (BayLDA), US data transfer section
7. **Regenerate intake PDFs** — Update provider references (Cal Video instead of RED Medical)
8. **Google Ads campaign** — €400 spend → €400 bonus credits. Tracking IDs already in HTML (commented out)

### Nice-to-Have

9. **German translation** — Switchable DE/EN site version
10. **Cookie banner bilingual** — Currently English only
11. **Schema markup (JSON-LD)** — Rich search snippets
12. **sitemap.xml + robots.txt** — SEO basics
13. **Uptime monitoring** — BetterStack free tier
14. **Error tracking** — Sentry free tier

---

## SaaS Checklist Cross-Reference (Non-SaaS Adaptations)

Mapping the uploaded SaaS checklist to this practice website project:

### Applicable & Done
- ✅ Landing page that explains value
- ✅ Pricing page/section
- ✅ Analytics on landing page (GA4 + Clarity)
- ✅ Domain and DNS set up
- ✅ Production environment configured
- ✅ SSL/HTTPS configured
- ✅ CI/CD pipeline (git push → Vercel auto-deploy)
- ✅ Environment variables managed securely (Vercel)
- ✅ Payment integration (Stripe via Cal.com)
- ✅ Webhook handling (booking + cancellation)
- ✅ Privacy policy
- ✅ Transactional email (signing URLs, receipts)
- ✅ Invoices / receipts
- ✅ Decision documentation (comprehensive README)
- ✅ Works on mobile / different screen sizes
- ✅ Contact method exists (email + phone)
- ✅ FAQ on site
- ✅ Secrets not in code (env vars)

### Applicable & Missing
- ⬜ **Conversion tracking** — Google Ads tracking IDs in HTML but commented out. Needs campaign creation + uncommenting.
- ⬜ **Open Graph tags: dynamic** — Static OG image exists but no dynamic per-page OG tags
- ⬜ **Schema markup (JSON-LD)** — Not implemented. Would improve search appearance.
- ⬜ **Canonical tags** — Present but only on main page. Variant pages may need updating.
- ⬜ **Server-side conversion tracking (CAPI)** — Not implemented. Client-side blocking reduces ad attribution accuracy.
- ⬜ **Sitemap.xml and robots.txt** — Not auto-generated or submitted to GSC.
- ✅ **Email deliverability (SPF, DKIM, DMARC)** — Configured at all-inkl. Stale Mailjet records cleaned up.
- ⬜ **Uptime monitoring** — No alerting if webhook endpoints go down.
- ⬜ **Error tracking** — No Sentry or equivalent. Errors only visible in Vercel function logs.
- ⬜ **Audit logging** — Webhook logs exist in Vercel but not queryable long-term.
- ⬜ **Social proof** — No testimonials or review integration (deliberately — BetterHelp reviews can't be used, FTC risk).

### Not Applicable (SaaS-specific)
- N/A Authentication & accounts (no user accounts — Cal.com handles this)
- N/A Subscription management (one-time session payments)
- N/A Database backups (no database — stateless serverless)
- N/A Staging environment (Vercel preview deployments serve this purpose)
- N/A Account deletion (no accounts to delete)
- N/A Churn analysis (not a subscription product)
- N/A Rate limiting (low traffic, webhook-only API surface)
- N/A SQL injection / XSS / CSRF (static site + serverless, no user input rendered)

---

## Google Ads Recommendation

The €400 spend → €400 bonus promotion is worth activating. Recommended approach:

1. **Create Google Ads account** → link to GA4 property
2. **Uncomment tracking in index.html** — replace `AW-XXXXXXXXX` with real conversion ID
3. **Create conversion action** — "Book session" button click or Cal.com booking confirmation
4. **Campaign targeting:**
   - Keywords: "Psychotherapie München online", "Heilpraktiker Psychotherapie online", "Therapeut München", "Psychologische Beratung München"
   - Location: Munich + 50km radius, Germany-wide for online
   - Budget: €15–20/day to use the €400 within ~25 days
5. **Consider server-side conversion tracking** later (Vercel function → Google Ads API) to capture conversions that client-side tracking misses due to ad blockers

Expected CPA: €30–80 per first session booking (psychotherapy keyword CPCs in Germany range €2–8).

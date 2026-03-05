# Project Status — 2026-03-05 (Updated)

## Overall Completeness: 100% Phase 1 + ~80% Phase 2 (Marketing & Polish)

Phase 1 (core product) is fully live and tested. Phase 2 (marketing, SEO, polish) is well underway — Google Ads campaign built, German translation done, legal compliance audited.

---

## What's Done (Working)

| Component | Status | Notes |
|---|---|---|
| **Landing page** | ✅ Live | `robertrozek.de`, inline Cal.com embed, responsive |
| **German translation** | ✅ Live | `/de/index.html`, `/de/datenschutz.html`, `/de/impressum.html`, DE/EN toggle |
| **Returning client page** | ✅ Built | `/returning.html` + `/de/returning.html`, €70, noindex, unlisted |
| **Booking flow** | ✅ Working | Cal.com → Stripe €150 (standard) / €70 (returning) |
| **E-signature** | ✅ Working | OpenAPI EU-SES, DPA signed, production tokens |
| **Payment receipt** | ✅ Built | Zahlungsbestätigung PDF auto-sent per booking via SMTP |
| **Monthly invoices** | ✅ Built | `tools/generate-rechnung.py` with GebüH codes, sequential numbering |
| **Cancellation webhook** | ✅ Built | Late cancellation detection, email notification |
| **Signing email** | ✅ Working | Branded HTML email with signing URL via all-inkl SMTP |
| **Privacy policy** | ✅ Updated | OpenAPI, Stripe, Cal.com, PayPal, Cal Video disclosed |
| **Impressum** | ✅ Updated | Phone number, Steuernummer, full legal info |
| **Intake documents** | ✅ Generated | DE + EN combined PDFs, 6 pages each |
| **Domain + SSL** | ✅ Live | `robertrozek.de` on Vercel with auto-SSL |
| **Analytics** | ✅ Active | GA4 (G-PJGQ4RBY5R) + Microsoft Clarity |
| **Favicon + OG image** | ✅ Added | Social sharing works |
| **HWG legal compliance** | ✅ Audited | Protected title fixed, competitor disparagement removed, §9 framing correct |
| **Self-hosted fonts** | ✅ Done | Instrument Serif + DM Sans in `/fonts/`, no Google CDN calls |
| **Security headers** | ✅ Done | CSP, HSTS, Permissions-Policy, X-Frame-Options in vercel.json |
| **Stripe customer emails** | ✅ Enabled | Successful payments + Refunds toggled on |
| **Email deliverability** | ✅ Configured | SPF + DKIM (2 keys) + DMARC at all-inkl |
| **DPAs (6/7)** | ✅ Signed | OpenAPI, all-inkl, Stripe, Vercel, GA4, Clarity |
| **Cookie banner bilingual** | ✅ Done | English + German versions on respective pages |
| **Google Ads campaign** | ✅ Built | 3 ad groups, 15 negative keywords, €10/day, paused. GA4 linked. |
| **Marketing strategy doc** | ✅ Written | MARKETING-STRATEGY.md — full HWG legal framework, ad copy, SEO plan |
| **Google Ads log** | ✅ Written | GOOGLE-ADS-LOG.md — all settings, decisions, caveats |
| **Variant pages archived** | ✅ Done | Doctolib + RED Medical variants moved to `/archive/` |

## What's Remaining

### Waiting on External (No Action Needed)

1. **Cal.com DPA countersignature** — Requested 2x, pending from Cal.com. Nothing to do but wait.

### Should-Do Before Launching Ads

2. **Google Ads conversion tracking code** — Get AW-XXXXXXXXX conversion ID, uncomment lines ~93 and ~128-132 in index.html, push. (Can also skip — GA4 page view tracking works as fallback.)
3. **Apply Google Ads promo code** — €400 spend → €400 bonus. Must be applied within 14 days of account creation.
4. **Remove Google Ads end date** — Currently set March 24–31. Remove end date before launch.

### Should-Do Soon (SEO)

5. **Google Search Console** — Request re-indexing (old cached text). Add property, submit sitemap.
6. **sitemap.xml** — Create and deploy. Include EN + DE pages, exclude /returning.html and /archive/.
7. **robots.txt** — Create and deploy. Reference sitemap, disallow archive + returning.
8. **JSON-LD schema markup** — MedicalBusiness structured data for rich search results.
9. **Google Business Profile** — Claim on business.google.com. Category: "Heilpraktiker" (NOT "Psychotherapeut"). Highest-impact free SEO action.

### Nice-to-Have

10. **Directory listings** — therapie.de, jameda.de, Doctolib (free backlinks + referral channels)
11. **Content pages for SEO** — `/online-therapie.html`, `/angst-therapie.html` etc. for keyword targeting
12. **Privacy policy additions** — Supervisory authority (BayLDA), US data transfer section
13. **Uptime monitoring** — BetterStack free tier
14. **Error tracking** — Sentry free tier
15. **Blog / articles section** — Long-term SEO content strategy

---

## Phase Summary

| Phase | Status | Description |
|---|---|---|
| **Phase 1: Core Product** | ✅ 100% | Site, booking, payments, legal docs, e-signature, webhooks |
| **Phase 2: Marketing & Polish** | ~80% | Ads built (not launched), DE translation done, HWG audit done. SEO basics (sitemap, robots.txt, GSC, JSON-LD, GBP) still pending. |
| **Phase 3: Growth** | Not started | Blog, content pages, directory listings, ongoing ad optimization |

---

*Last updated 2026-03-05.*

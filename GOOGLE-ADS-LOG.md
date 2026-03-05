# Google Ads Campaign Log — robertrozek.de
## Created 2026-03-05

---

## Campaign: "Search - Psychotherapie München"

### Settings
- **Type:** Search (not Performance Max, not Display)
- **Objective:** Website traffic → Page views
- **Bidding:** Maximize conversions, no target CPA set (let Google learn first)
- **Budget:** €10/day custom (ignore Google's "recommended" €53/day — they always upsell)
- **Networks:** Google Search + Search Partners only. **Display Network unchecked.**
- **Location:** Germany (entire country, not city-specific)
- **Location option:** "Presence: People in or regularly in" (NOT "Presence or interest")
- **Languages:** German + English
- **Start date:** March 24, 2026 (set in the future to prevent accidental spend — CHANGE before launch)
- **End date:** March 31, 2026 (REMOVE before launch — should be open-ended)
- **Status:** Paused
- **Customer acquisition:** Bid equally for new and existing (default)
- **EU political ads:** No

### What We Turned OFF
- **AI Max for Search:** disabled. Prevents Google from rewriting URLs (Final URL expansion) and auto-generating ad copy (Text customization). Critical for HWG compliance — we control every word.
- **Enhanced conversions:** declined. Sends hashed user data (emails) to Google — DSGVO problem for therapy practice. Standard conversion tracking is sufficient.
- **Display Network:** unchecked. Don't want therapy ads as banners on random websites.
- **Keyword & asset generation by Google AI:** skipped auto-generation, built everything manually.

---

## Ad Groups

### Ad Group 1: München Psychotherapie (German)
**Keywords (phrase match):**
- "Psychotherapie München"
- "Therapeut München"
- "Psychotherapie München online"
- "Heilpraktiker Psychotherapie München"
- "Psychologische Beratung München"
- "Psychotherapie online München"

**Display path:** robertrozek.de/Psychotherapie/München

**Headlines (7):**
1. Psychotherapie München · Online
2. Praxis Robert Rozek, MSc, MA
3. Erstgespräch buchen
4. Sichere Videositzungen
5. Heilpraktiker f. Psychotherapie
6. Flexible Termine · 10–16 Uhr
7. Philosophisch fundierte Praxis

**Descriptions (2):**
1. Psychotherapie (n. d. HeilprG) in München. Sitzungen per sicherem Video. Termin buchen. (88 chars)
2. Heilpraktiker f. Psychotherapie. GebüH-Rechnung für PKV. Flexible Termine verfügbar. (84 chars)

### Ad Group 2: Online Therapie DE (German)
**Keywords (phrase match):**
- "Online Psychotherapie"
- "Online Therapie deutsch"
- "Videotherapie"
- "Therapie online buchen"
- "Psychotherapie per Video"
- "Online Psychotherapie deutsch"

**Display path:** robertrozek.de/Online/Therapie

**Headlines (7):**
1. Online Psychotherapie buchen
2. Praxis Robert Rozek, MSc, MA
3. Sichere Videositzungen
4. Heilpraktiker f. Psychotherapie
5. Flexible Termine · 10–16 Uhr
6. Therapie bequem von zu Hause
7. Philosophisch fundierte Praxis

**Descriptions (2):**
1. Online-Psychotherapie (n. d. HeilprG). Sichere Videositzungen, flexible Termine. Jetzt buchen. (90 chars)
2. Heilpraktiker f. Psychotherapie. GebüH-Rechnung für PKV. Flexible Termine verfügbar. (84 chars)

### Ad Group 3: Online Therapy EN (English)
**Keywords (phrase match):**
- "online therapy English Germany"
- "English speaking therapist Germany"
- "online psychotherapy English"
- "English therapist Munich"
- "online therapy in English"
- "expat therapist Germany"

**Display path:** robertrozek.de/Online/Therapy

**Headlines (7):**
1. Online Psychotherapy · English
2. Robert Rozek, MSc, MA
3. Book Your Session Today
4. Secure Video Sessions
5. Munich-Based Practice
6. Flexible Daytime Sessions
7. Philosophical Approach

**Descriptions (2):**
1. Online psychotherapy from Munich. Secure video, flexible scheduling. Book your session now. (90 chars)
2. English-speaking practitioner. Invoices for private insurance (GebüH). Flexible scheduling. (90 chars)

### Sitelinks (campaign-level, shared across all ad groups)
1. About → https://robertrozek.de/#about
2. Approach → https://robertrozek.de/#approach
3. Pricing → https://robertrozek.de/#pricing
4. Book Session → https://robertrozek.de/#book

### Business Name
Robert Rozek (25 char limit — can't fit full HeilprG designation here)

---

## Negative Keywords (campaign-level, broad match) ✅ Added

15 negative keywords blocking training seekers, job hunters, freebie seekers, and public insurance searches:

Ausbildung, Prüfung, Studium, kostenlos, gratis, Krankenkasse, Kassenzulassung, Stellenangebote, Jobs, Gehalt, Praktikum, Fernstudium, Therapeut werden, Heilpraktiker werden, Prüfungsfragen

---

## Conversion Tracking ✅ Done via GA4 Import

- **"Book appointment" conversion action created** (2026-03-05) — imported `booking_click` GA4 event directly. No code changes needed in index.html.
- Type: Book appointment, Source: Google Analytics (GA4), Event: booking_click
- Count: Every conversion, Click-through window: 30 days, Attribution: Data-driven
- Value: Uses GA4 property value, fallback €1
- The `AW-XXXXXXXXX` placeholders in index.html are NOT needed — GA4 import method is used instead. Leave them commented out.

Note: "Use the Google tag found on your website" failed with permission denied during initial setup. GA4 was already linked via Tools → Linked accounts (since Feb 27, 2026). App and web metrics: On. Google Analytics audiences import: Off (DSGVO — no remarketing for health data).

---

## Promo Code ✅ Active

- **Code:** 3CXR6-6QURN-HAU6, redeemed Feb 27, 2026
- **Deal:** Spend €400 → get €400 bonus credit
- **Deadline:** April 28, 2026 (spend must reach €400 by then)
- Amount spent so far: €0.00

---

## SEO (supporting the ads) ✅ Deployed

- `public/sitemap.xml` — 6 pages (3 EN + 3 DE), hreflang cross-references, excludes /returning and /archive
- `public/robots.txt` — blocks /returning.html, /de/returning.html, /archive/, /coaching.html
- JSON-LD on `public/index.html` and `public/de/index.html` — MedicalBusiness type, hours 10–16 Mon–Fri, €150/session
- **Google Search Console** — Property verified, sitemap submitted, re-indexing requested (2026-03-05)

---

## Decisions & Reasoning

### Why Search, not Performance Max?
Performance Max shows ads across Display, YouTube, Gmail etc. — broad reach but low intent. Search targets people actively typing queries. For a niche therapy practice with €10/day budget, every click needs to count.

### Why phrase match (quotes) on all keywords?
Broad match (no quotes) lets Google show ads for loosely related searches. With health keywords, this means wasted budget on irrelevant clicks. Phrase match ensures the user's search contains your actual phrase.

### Why no symptom ad group?
Considered a 4th group targeting "Angst Therapie", "Burnout Therapeut" etc. Decided against it because: (a) §12 HWG restricts advertising for certain conditions, (b) general terms like Angst/Burnout are technically permitted but the preference was to be cautious. Can add later.

### Why Germany-wide, not Munich-only?
Practice is fully online — anyone in Germany can book. Munich keywords still capture Munich-intent searches regardless of geo-targeting. Germany-wide casts a wider net at same budget.

### Why €10/day?
€400 promo: spend €400 in 60 days → get €400 bonus credit. At €10/day, spend €400 in ~40 days. Leaves room to increase if results are good. Google recommends €53/day — ignore this, it's always inflated.

### Why no evening mentions in ads?
Practice hours are 10:00–16:00. Original ad copy said "Abends verfügbar" — corrected to "Flexible Termine · 10–16 Uhr" and "Flexible Daytime Sessions."

### Why no Google Business Profile?
Decided NOT to create one. Therapy practice by nature involves confrontational work with difficult personalities. Negative reviews are a structural risk that outweighs the SEO benefit of map pack visibility.

---

## Policy Issues Encountered

### "Health in personalized advertising" flag
Google flagged all therapy-related keywords under health policy. This is standard — doesn't mean rejection. Means ads can't use personalized targeting (remarketing based on health interests) but can run on Search. Requested exception for all 3 ad groups.

### Enhanced conversions DSGVO concern
Declined. Sends hashed client emails to Google for ad matching. For a therapy practice, client emails are health-adjacent data under DSGVO. Would need separate explicit consent from each client, and Datenschutzerklärung doesn't cover it.

---

## Before Launching (Remaining Checklist)

- [ ] Remove end date (currently March 31 — should be open-ended)
- [ ] Change start date to actual launch date
- [ ] Enable campaign

Three clicks.

---

*Log created 2026-03-05. Last updated 2026-03-05.*

# Marketing Strategy — robertrozek.de
## Google Ads + SEO Plan · March 2026

---

## Part 1: Google Ads (€400 Bonus Campaign)

### How the Promotion Works

Google's new advertiser promo: spend €400 within 60 days, receive €400 in matching credit. Total effective budget: €800. The credit appears after a verification period of up to 35 days. One coupon per account, billing address must be in Germany.

### Setup Checklist

1. Create a Google Ads account at ads.google.com (use your Google account linked to GA4 property G-PJGQ4RBY5R)
2. Link Google Ads to your GA4 property (Admin → Google Ads Links)
3. Apply the promo code within 14 days of account creation
4. In `index.html`, replace `AW-XXXXXXXXX` with your real Google Ads conversion ID on lines 93 and 129
5. Uncomment the two Google Ads code blocks (line 93: `gtag('config', ...)` and lines 128–132: conversion event)
6. Create a conversion action in Google Ads: "Book Session" → track the `booking_click` event already firing in your GA4

### Budget Plan

| Week | Daily Budget | Total Spend | Notes |
|------|-------------|-------------|-------|
| 1–2 | €10/day | ~€140 | Learning phase — Google optimizes delivery |
| 3–4 | €15/day | ~€210 | Increase if CTR > 3% |
| 5+ | Pause or continue | ~€50 buffer | Evaluate ROI, then decide |
| **Total** | | **~€400** | Triggers €400 bonus credit |

After the initial €400 spend, you'll have €400 in bonus credit. Use that to continue at €15/day for another ~27 days, or pause and reassess.

### Campaign Structure

**Campaign type:** Search (not Performance Max — you want high-intent keyword targeting, not broad display)

**Ad Group 1 — Munich Psychotherapy (Location-Intent)**

Keywords (phrase match):
- "Psychotherapie München"
- "Therapeut München"
- "Psychotherapie München online"
- "Heilpraktiker Psychotherapie München"
- "Psychologische Beratung München"

**Ad Group 2 — Online Therapy (Modality-Intent)**

Keywords (phrase match):
- "Online Psychotherapie"
- "Online Therapie deutsch"
- "Videotherapie"
- "Therapie online buchen"
- "Psychotherapie per Video"

**Ad Group 3 — Specific Concerns (Symptom-Intent)**

Keywords (phrase match):
- "Angst Therapie München"
- "Burnout Therapeut München"
- "Depression Hilfe München"
- "Panikattacken Therapie online"
- "Lebenskrise Therapeut"

**Negative keywords** (add from day 1):
- "Psychotherapeut Ausbildung"
- "Heilpraktiker Prüfung"
- "Psychologie Studium"
- "kostenlos"
- "Krankenkasse" (since you're private-pay / Zusatzversicherung, not GKV-funded)
- "Kassenzulassung"
- "Stellenangebote"
- "Jobs"

### Ad Copy Drafts

**HWG Compliance Note:** Under the Heilmittelwerbegesetz, you cannot promise specific therapeutic outcomes, claim guaranteed success, or use patient testimonials. Ads must be factual and avoid misleading health claims.

**Ad 1 — General:**
- Headline 1: Psychotherapie München · Online-Termine
- Headline 2: Praxis Robert Rozek, MSc, MA
- Headline 3: Erstgespräch buchen — €150/Sitzung
- Description 1: Praxis für Psychotherapie (n. d. HeilprG) in München. Sitzungen auch per sicherem Video möglich. Philosophisch fundiert, klinisch orientiert.
- Description 2: Heilpraktiker für Psychotherapie. Rechnung nach GebüH für PKV und Zusatzversicherung. Flexible Termine, abends verfügbar.
- Final URL: https://robertrozek.de/

**Ad 2 — Munich Focus:**
- Headline 1: Therapeut in München · Online-Sitzungen
- Headline 2: Termin in wenigen Klicks buchen
- Headline 3: Sichere Videositzungen · GebüH-Rechnung
- Description 1: Psychotherapie-Praxis in München mit Online-Sitzungen per verschlüsseltem Video. Abendtermine verfügbar.
- Description 2: Heilpraktiker für Psychotherapie. Transparente Preise, keine versteckten Kosten. Rechnungserstellung für Versicherung.
- Final URL: https://robertrozek.de/

**Ad 3 — English (international audience):**
- Headline 1: Psychotherapy Practice · Munich
- Headline 2: Book Your Session in Minutes
- Headline 3: Secure Video · €150/Session
- Description 1: Psychotherapy (n. d. HeilprG) grounded in continental philosophy and clinical practice. Secure video sessions from Munich. Evening availability.
- Description 2: English-speaking practitioner. Flexible scheduling, transparent pricing, GebüH invoices for insurance reimbursement.
- Final URL: https://robertrozek.de/

### Targeting Settings

| Setting | Value |
|---------|-------|
| **Location** | Munich + 50 km radius (primary), all of Germany (secondary, lower bid) |
| **Language** | German + English |
| **Devices** | All (mobile + desktop) |
| **Schedule** | Mon–Fri 8:00–21:00, Sat 10:00–18:00 |
| **Bid strategy** | Maximize conversions (let Google learn, then switch to Target CPA after 15+ conversions) |

### Expected Performance

Based on industry data for psychotherapy keywords in Germany:
- CPC range: €0.60–€2.50 (Munich may be on the higher end)
- Expected CTR: 3–6% for well-targeted search ads
- With €800 total budget at ~€1.50 average CPC: ~530 clicks
- If 3–5% of clicks book: 16–27 bookings
- **Expected CPA: €30–50 per first session booking**

### Conversion Tracking (Already Partially Built)

Your site already has:
- `trackBooking()` function firing GA4 events (line 117–133 in index.html)
- Google Ads conversion placeholder ready to uncomment (line 128–132)
- Scroll depth tracking (25/50/75/90%)

To activate:
1. Create a conversion action in Google Ads dashboard
2. Copy the conversion ID and label
3. Replace `AW-XXXXXXXXX/CONVERSION_LABEL` on line 129
4. Uncomment lines 93 and 128–132

---

## Part 2: SEO Strategy

### Current State

Your site is indexed at robertrozek.de but may still show cached "Psychoanalytic Practice" text. The fundamentals are solid (canonical URL, meta description, OG tags, mobile-responsive), but several SEO foundations are missing.

### Immediate Actions (This Week)

#### 1. Google Search Console

- Go to search.google.com/search-console
- Add property for `robertrozek.de` (you likely already have it via GA4)
- Request re-indexing of the homepage (URL Inspection → Request Indexing)
- This clears any cached old content from search results

#### 2. sitemap.xml

Create a simple sitemap at `public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://robertrozek.de/</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://robertrozek.de/datenschutz.html</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
  <url>
    <loc>https://robertrozek.de/impressum.html</loc>
    <lastmod>2026-03-05</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>
</urlset>
```

#### 3. robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /
Sitemap: https://robertrozek.de/sitemap.xml

# Block variant pages from indexing
Disallow: /variant-doctolib.html
Disallow: /variant-redmedical.html
Disallow: /coaching.html
```

#### 4. JSON-LD Schema Markup

Add this to `index.html` inside `<head>`, after the OG tags:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MedicalBusiness",
  "name": "Praxis für Psychotherapie — Robert Rozek",
  "description": "Online psychotherapy grounded in continental philosophy, Lacanian theory, and clinical practice. Sessions via secure video from Munich.",
  "url": "https://robertrozek.de",
  "telephone": "+49-XXX-XXXXXXX",
  "email": "rozek.therapy@pm.me",
  "image": "https://robertrozek.de/og-image.png",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Augsburgerstraße 6",
    "addressLocality": "München",
    "postalCode": "80337",
    "addressCountry": "DE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "48.1269",
    "longitude": "11.5587"
  },
  "priceRange": "€150 per session",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "21:00"
    }
  ],
  "medicalSpecialty": "Psychiatric",
  "availableService": {
    "@type": "MedicalTherapy",
    "name": "Online Psychotherapy",
    "description": "Individual psychotherapy sessions via secure video"
  },
  "sameAs": []
}
</script>
```

(Replace the phone number placeholder with your actual number.)

### Medium-Term SEO (Next 1–3 Months)

#### 5. Content Pages for Keyword Targeting

Your single-page site ranks for branded searches but won't easily rank for broader terms like "Psychotherapie München online." Consider adding dedicated pages:

**Priority pages:**

- `/angst-therapie.html` — "Angsttherapie München / online" (targets anxiety-related searches)
- `/burnout-therapie.html` — "Burnout Therapie München" (high search volume in Munich)
- `/online-therapie.html` — "Online Psychotherapie" (captures modality-focused searches)

Each page should be 400–800 words, unique content (not duplicated from the homepage), with a clear CTA linking back to the booking embed. This gives Google more landing surfaces to rank.

#### 6. Google Business Profile

If you have a physical practice address (Augsburgerstraße 6), claim it on Google Business Profile (business.google.com). This is free and gets you into the local map pack for "Psychotherapie München." Include:
- Business category: "Heilpraktiker" (do NOT select "Psychotherapeut" — protected title, see Part 3 §3.2)
- Photos of the practice space (even if sessions are online, having a verified address helps)
- Link to robertrozek.de
- Opening hours

This is the single highest-impact free SEO action for local practices.

#### 7. Directory Listings (Free)

Register on the major German therapy directories:
- **therapie.de** — 1,182 therapists listed in Munich, free basic profile
- **Psychotherapeutensuche.de** — PTK Bayern directory
- **Doctolib** — growing in Germany, allows online booking
- **jameda.de** — Germany's largest doctor/therapist review platform

Each listing = a backlink + a referral channel. Prioritize therapie.de and jameda as they dominate German health search results.

#### 8. Meta Description Optimization

Current meta description is good but could include more searchable terms. Consider:

```
Online-Psychotherapie (n. d. HeilprG) aus München. Philosophisch fundiert, klinisch orientiert. Sichere Videositzungen, GebüH-Rechnung für PKV. Termin buchen auf robertrozek.de.
```

This targets: Psychotherapie, München, HeilprG, online, GebüH, PKV — all terms your potential clients search for.

### Long-Term SEO (3–6 Months)

#### 9. Blog / Articles Section

Consider a `/articles/` section with 1–2 posts per month on topics relevant to your practice:
- "Was erwartet mich bei einer Psychotherapie-Sitzung?"
- "Psychotherapie online vs. in Person — was passt zu mir?"
- "Angst verstehen: ein philosophischer Ansatz"

These build topical authority and capture long-tail search traffic. They also give Google Ads more landing page options for specific ad groups.

#### 10. Backlink Strategy

Beyond directories, quality backlinks from:
- VFP (Verband Freier Psychotherapeuten) membership listing
- University pages (if you have academic affiliations)
- Guest articles on psychology/philosophy blogs
- Your Google Scholar profile linking back to your practice

---

## Part 3: German Advertising Law — Full Legal Framework

All advertising (Google Ads, SEO content, directory listings, website copy) must comply with multiple overlapping German laws. This section covers each one and what it means for your practice.

### 3.1 Heilmittelwerbegesetz (HWG) — Medicinal Advertising Act

The HWG is the primary law governing health-related advertising in Germany. Last amended July 2023 (BGBl. 2023 I Nr. 197).

**§3 HWG — No Misleading Advertising (Irreführungsverbot)**

Advertising is unlawful if it attributes therapeutic effects that a treatment does not have, creates a false impression that success is guaranteed, or suggests no side effects will occur. This means:

- FORBIDDEN: "Ich heile Ihre Angststörung" / "Guaranteed anxiety relief"
- FORBIDDEN: "100% Erfolgsquote" / "Proven results"
- PERMITTED: "Psychotherapie bei Angst, Burnout und Lebenskrisen" (factual description of what you treat)
- PERMITTED: "Philosophisch fundierte klinische Praxis" (describing your approach without claiming outcomes)

Courts require that any therapeutic claims be backed by studies conducted according to recognized scientific research principles — anecdotal success stories do not suffice.

**§9 HWG — Remote Treatment Advertising Ban (Fernbehandlungsverbot)**

This is the most critical rule for your online-only practice. §9 sentence 1 prohibits advertising for diagnosis or treatment that is not based on personal examination of the patient (Fernbehandlung).

However, §9 sentence 2 (added 2019) creates an exception: advertising for remote treatment via communication media is permitted **if recognized professional standards do not require in-person contact**.

For psychotherapy, the legal situation is nuanced. The BGH ruled on 09.12.2021 that the exception applies only when "allgemein anerkannte fachliche Standards" (generally recognized professional standards) confirm in-person contact is not required. For psychotherapy, video sessions are increasingly accepted as standard practice (especially post-COVID), but this remains a gray area for Heilpraktiker specifically.

**Practical recommendation:** Do NOT advertise explicitly as "Fernbehandlung" or "treatment without in-person contact." Instead, frame it as: "Online-Sitzungen per sicherem Video" (online sessions via secure video) and "Praxis in München mit Online-Termine" (practice in Munich with online appointments). This positions video as a delivery method for your Munich-based practice, not as a fundamentally remote treatment.

**§11 HWG — Prohibited Advertising Methods (outside professional circles)**

When advertising to the general public (which Google Ads and your website are), the following are prohibited:

- Expert/celebrity endorsements or recommendations
- Patient case histories presented in a misleading way
- Before/after imagery of disease effects
- Statements suggesting health depends on using a specific product/service
- Unsolicited testimonials or Erfahrungsberichte
- Advertising targeting children under 14
- Prize giveaways or contests linked to health services
- Free treatment samples to encourage continued use

This means: NO client testimonials on your website or in ads, NO "Erfahrungsberichte" section, NO influencer partnerships or expert endorsements.

**§12 HWG — Disease-Specific Advertising Restrictions**

You cannot advertise treatments for certain conditions to the public, including: reportable infectious diseases, cancer, substance addictions (except nicotine), and certain pregnancy complications.

This means: You can say "Psychotherapie bei Angst und Burnout" but you should NOT advertise treatment of "Suchterkrankungen" (addiction disorders) or specific psychiatric diagnoses from the restricted list.

### 3.2 Title Protection — "Psychotherapeut" is FORBIDDEN

Under §1 PsychThG (Psychotherapeutengesetz), "Psychotherapeut/in" is a legally protected professional title. Using it as a Heilpraktiker für Psychotherapie constitutes title misuse under §132a StGB and can result in fines or up to one year imprisonment.

The Deutscher Konsumentenbund e.V. has conducted mass cease-and-desist campaigns against Heilpraktiker who used "Psychotherapeut" — even with qualifying additions like "Psychotherapeut (HPG)" or "heilpraktische Psychotherapeutin."

**What IS allowed:**

- "Heilpraktiker für Psychotherapie" (the official designation)
- "Psychotherapie (n. d. HeilprG)" or "Psychotherapie nach dem Heilpraktikergesetz"
- "Praxis für Psychotherapie" (describing the service, not claiming the title)
- Describing your work as "psychotherapeutische Praxis" (the activity, not the title)

**What is NOT allowed:**

- "Psychotherapeut" (in any form)
- "Psychotherapeutin"
- "Psychotherapeut (HPG)" / "Psychotherapeut (HeilprG)"
- "heilpraktische Psychotherapeutin"

Your current site uses "Psychotherapy Practice (n. d. HeilprG)" — this is correct. In German ads, use "Praxis für Psychotherapie (n. d. HeilprG)" or "Heilpraktiker für Psychotherapie."

**Google Business Profile warning:** Google and Bing automatically categorize Heilpraktiker as "Psychotherapeut" or "Alternativmediziner" in their business profiles. The VFP (Verband Freier Psychotherapeuten) has documented this problem extensively and is pursuing legal action. When you create your Google Business Profile, manually set the category and check regularly that Google hasn't auto-changed it to a protected title — this could trigger a Abmahnung (cease-and-desist).

### 3.3 UWG — Unfair Competition Act

The UWG provides additional protection against unfair advertising practices:

- All advertising must be truthful, comprehensible, and non-deceptive
- Exploiting patient fears or vulnerability is prohibited
- You cannot disparage competitors or their methods
- Aggressive commercial practices (creating pressure to book) are forbidden

Professional associations and competitors actively monitor and enforce these rules through Abmahnungen.

### 3.4 Compliance Assessment of Your Current Ads

| Law | Rule | Your Ad Copy Status |
|-----|------|-------------------|
| HWG §3 | No misleading claims or guaranteed outcomes | ✅ Compliant — describes approach, not outcomes |
| HWG §9 | Remote treatment advertising restrictions | ⚠️ Review needed — see recommendation above. Frame as "Munich practice with online sessions," not pure Fernbehandlung |
| HWG §11 | No testimonials, no expert endorsements to public | ✅ Compliant — no testimonials used |
| HWG §12 | No advertising treatment for restricted conditions | ✅ Compliant — only general terms (Angst, Burnout, Lebenskrise) |
| PsychThG §1 | No use of "Psychotherapeut" title | ✅ Compliant — uses "Psychotherapie (n. d. HeilprG)" |
| UWG | No fear-based, aggressive, or deceptive messaging | ✅ Compliant — neutral, informational tone |
| UWG | No competitor disparagement | ✅ Compliant — no comparisons made |

### 3.5 Ad Copy Red Lines — Never Use These

- "Ich bin Psychotherapeut" / "I am a psychotherapist"
- "Heilung garantiert" / "Guaranteed healing"
- "Behandlung ohne Vorkenntnisse" / treatment claims without evidence
- "Meine Patienten sagen..." / patient testimonials
- "Besser als [competitor method]" / competitor disparagement
- "Suchttherapie" / addiction treatment (§12 restricted)
- "Behandlung von Depression" as a standalone diagnostic claim (use "Unterstützung bei depressiven Verstimmungen" instead)
- "Fernbehandlung" / "remote treatment" (use "Online-Sitzungen" instead)

---

## Part 4: Implementation Timeline

### Week 1 (Now)
- [ ] Create Google Ads account
- [ ] Apply promo code
- [ ] Create sitemap.xml and robots.txt
- [ ] Add JSON-LD schema markup to index.html
- [ ] Request re-indexing in Google Search Console
- [ ] Uncomment Google Ads tracking code in index.html (after getting conversion ID)

### Week 2
- [ ] Launch Ad Groups 1 + 2 (Munich + Online keywords)
- [ ] Claim Google Business Profile
- [ ] Register on therapie.de

### Week 3–4
- [ ] Review Google Ads performance (CTR, CPC, conversions)
- [ ] Add Ad Group 3 (symptom keywords) if budget allows
- [ ] Add negative keywords based on search terms report
- [ ] Register on jameda.de and Doctolib

### Month 2–3
- [ ] Create 1–2 dedicated landing pages (angst-therapie.html, online-therapie.html)
- [ ] Optimize based on Google Ads search terms data (which keywords actually convert)
- [ ] Consider starting a blog section
- [ ] Evaluate whether to continue Google Ads beyond the €800 (€400 spend + €400 bonus)

---

## Key Metrics to Track

| Metric | Where to Check | Target |
|--------|---------------|--------|
| **Google Ads CPC** | Google Ads dashboard | < €2.50 |
| **Google Ads CTR** | Google Ads dashboard | > 3% |
| **Cost per booking** | GA4 → Conversions | < €50 |
| **Organic impressions** | Google Search Console | Growing month-over-month |
| **Organic clicks** | Google Search Console | > 50/month within 3 months |
| **Booking conversion rate** | GA4 → Events | > 3% of site visitors |

---

*Document created 2026-03-05. Review and update monthly based on performance data.*

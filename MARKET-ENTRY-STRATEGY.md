# Market Entry Strategy — Psychoanalytic Practice

**Robert Rozek, MSc, MA — Heilpraktiker für Psychotherapie**  
**Expansion roadmap: Germany → DACH → UK → USA**  
**Date:** 2026-03-04

---

## Executive Summary

This document outlines the phased expansion of a Munich-based online psychoanalytic practice into four markets. Each phase builds on the previous one's infrastructure, legal framework, and client base. The core offering — online psychoanalytic counseling grounded in Lacanian theory and continental philosophy — remains consistent, but framing, pricing, legal structure, and compliance requirements differ significantly by jurisdiction.

---

## Phase 1: Germany (Current — Stabilize & Optimize)

### Status
Live. Booking flow functional (Cal.com → Stripe → DocuSign → RED Medical). Landing page deployed on Vercel.

### Legal Framework
- **License:** Heilpraktiker für Psychotherapie (HeilPrG § 1)
- **Scope:** Psychotherapy permitted under Heilpraktikergesetz. No Kassenzulassung (not billing public health insurance).
- **Title:** "Psychotherapie" is legally usable with HP-Psych license in Germany. Also: "Psychologische Beratung" (psychological counseling) for non-clinical framing.
- **Tax:** VAT-exempt under § 4 Nr. 14 UStG (psychotherapeutic services by Heilpraktiker).
- **Data protection:** DSGVO (full compliance required, Art. 9 health data).
- **Insurance reimbursement:** Private insurance (PKV) and Zusatzversicherungen may reimburse via GebüH invoices. No GKV (public insurance) billing.

### Immediate Actions
1. Fix site audit issues (see SITE-AUDIT.md) — especially CHF→EUR, free consultation flow, privacy policy gaps
2. Decide on free consultation: create a separate free 15–30 min Cal.com event type (recommended)
3. Set Cal.com price back to €150 (currently at test value)
4. Re-enable webhook signature verification
5. Remove debug logging from serverless functions
6. Self-host Google Fonts (DSGVO compliance, performance)
7. Add phone number to Impressum
8. Create favicon and OG image for social sharing
9. Set up Google Ads campaign (tracking IDs already in place, just commented out)
10. Switch DocuSign from sandbox to production (EU endpoint)

### Marketing Channels
- **Google Ads:** Target keywords like "Psychotherapie München online", "Psychoanalytiker München", "Heilpraktiker Psychotherapie online"
- **Google Scholar profile:** Already linked — drives credibility with academic/intellectual clients
- **Psychology Today Germany (therapie.de):** List practice — major referral source for German therapists
- **Directories:** therapie.de, psychotherapiesuche.de, heilnetz.de
- **Content:** Blog posts (on the site or Medium) on psychoanalysis, Lacanian concepts, existential themes — SEO-driven
- **Referrals:** Network with other Heilpraktiker, supervisees, university contacts

### KPIs (First 6 Months)
- 5–10 regular weekly clients
- Stable booking funnel (conversion rate from visit → booking > 3%)
- Google Ads CPA < €50 per first session
- At least 2 directory listings live

---

## Phase 2: DACH Expansion (Austria + Switzerland)

### Timeline
3–6 months after Phase 1 stabilization.

### Why DACH First
- Same language (German)
- Similar cultural understanding of psychoanalysis
- Existing legal and regulatory similarities
- Can serve from Munich without relocating
- RED Medical works internationally (no IP restrictions, KBV-certified but usable worldwide)

### Austria

#### Legal Requirements
- **No equivalent of Heilpraktikergesetz.** Austria has the Psychotherapiegesetz (PthG) and Psychologengesetz 2013.
- **Title protection:** "Psychotherapeut/in" is a protected title requiring Austrian PthG registration. Cannot use this title without Austrian registration.
- **What's allowed:** "Psychologische Beratung" (psychological counseling) is permitted for qualified psychologists under Lebens- und Sozialberatung (LSB) framework, BUT requires an Austrian Gewerbeberechtigung (trade license).
- **Cross-border services:** Under EU Services Directive (2006/123/EC), temporary cross-border service provision is possible without local establishment, but the scope for health-adjacent services is limited.
- **Recommended framing:** "Psychoanalytische Beratung" or "Philosophische Praxis" (philosophical practice) — avoids regulated health profession titles.
- **Tax:** If providing services to Austrian consumers from Germany, VAT follows the B2C rule: place of supply is where the customer is (§ 3a(1) UStG). However, health services are VAT-exempt if they qualify under § 6(1)(19) UStG (Aus) or the German exemption applies cross-border under EU VAT rules. Requires assessment.
- **Data protection:** Same as Germany (DSGVO/EU GDPR). No additional requirements beyond what's already implemented.

#### Actions
- Add German-language content clarifying scope for Austrian clients ("Psychoanalytische Beratung, keine Psychotherapie im Sinne des PthG")
- Research whether Lebens- und Sozialberatung (LSB) Gewerbeberechtigung is needed or if EU cross-border exemption applies
- Check VAT obligations (may need Austrian VAT registration if exceeding €35,000 threshold for distance sales — unlikely initially)
- Consider listing on Austrian directories (bestHELP.at, psyonline.at) — check if HP-Psych qualification is accepted

#### Pricing
- Keep €150 (Eurozone, same currency)
- Austrian market may tolerate slightly higher prices (Vienna average is €80–150 for non-insurance psychotherapy)

### Switzerland

#### Legal Requirements
- **Title protection:** "Psychotherapeut/in" requires cantonal authorization under PsyG (Psychologieberufegesetz). Federal law since 2013.
- **What's allowed:** "Beratung" (counseling) is less regulated but varies by canton. Zurich and Bern are stricter than smaller cantons.
- **Cross-border services:** Switzerland is NOT in the EU. Service provision from Germany to Switzerland falls under bilateral agreements (CH-EU Agreement on Free Movement of Persons), but health professions have specific mutual recognition procedures.
- **Recommended framing:** "Psychoanalytische Beratung" or "Coaching" — avoid "Psychotherapie" without Swiss authorization.
- **Tax:** Switzerland is not in the EU VAT area. If services are provided from Germany to Swiss consumers, German VAT rules apply (reverse charge not applicable for B2C). The €150 price is already net of German VAT (exempt). Swiss Mehrwertsteuer (MWST) may apply if you establish a presence — but for cross-border digital services under CHF 100,000/year, registration is not required.
- **Data protection:** Swiss FADP (nDSG, revised 2023) — largely GDPR-aligned but with some differences. No adequacy concern (Switzerland has EU adequacy decision). Current DSGVO compliance likely sufficient.
- **Currency:** CHF. Must offer CHF pricing for Swiss market.

#### Actions
- Create a Swiss variant pricing section (CHF 160–180 recommended, reflecting purchasing power parity)
- Add CHF payment option in Cal.com (separate event type or dynamic currency)
- Clarify on site: "Psychoanalytische Beratung — kein Angebot im Sinne des PsyG"
- Consider listing on Swiss directories (psychologie.ch, sanitas-verified practitioners)
- Assess whether the Bilateral Agreement covers your qualification for temporary cross-border services

#### Pricing
- CHF 160–180 per session (PPP-adjusted; Swiss therapy market averages CHF 150–220)
- Separate Cal.com event type with CHF/Stripe

### DACH-Wide Actions
- Create a `/dach` or region-specific FAQ section addressing cross-border service questions
- Prepare a standard disclaimer template: "Dieses Angebot stellt keine Psychotherapie im Sinne des [PthG/PsyG] dar."
- Add Austrian and Swiss emergency hotlines to the site footer (Telefonseelsorge Austria: 142, Die Dargebotene Hand Switzerland: 143)
- Marketing: German-language Google Ads targeting Austria and Switzerland

---

## Phase 3: United Kingdom

### Timeline
6–12 months after launch, or when DACH client base is established.

### Why UK
- English-speaking (existing site content usable)
- Strong psychoanalytic tradition (Tavistock, Institute of Psychoanalysis, British Psychoanalytic Association)
- Less regulated than expected — "counsellor" and "psychotherapist" are NOT protected titles in the UK
- Large expat community familiar with European practice models
- Post-Brexit but culturally aligned

### Legal Requirements
- **Title protection:** Neither "counsellor" nor "psychotherapist" is a protected title in England and Wales. The title "practitioner psychologist" IS protected by HCPC (Health and Care Professions Council), but "psychotherapist" is not. Scotland has similar rules.
- **Voluntary registers:** BACP (British Association for Counselling and Psychotherapy), UKCP (UK Council for Psychotherapy), BPC (British Psychoanalytic Council) maintain voluntary registers. Membership adds credibility but is not legally required.
- **What's allowed:** Offering "psychoanalytic counselling" or "psychoanalytic psychotherapy" is legally permitted without UK registration, provided you don't claim to be a "practitioner psychologist" (HCPC-regulated).
- **Recommended framing:** "Psychoanalytic Counsellor" or "Psychoanalytic Psychotherapist" — both legally usable. Mentioning Lacanian orientation is a plus in UK psychoanalytic circles.
- **Insurance:** Professional indemnity insurance (PII) is not legally required for non-registered practitioners but is strongly recommended. Check if German Berufshaftpflicht covers UK clients.
- **Tax:** UK VAT. If supplying B2C digital/professional services to UK consumers from Germany, you may need to register for UK VAT if exceeding £85,000 threshold. Health services may be VAT-exempt if they qualify under UK VAT Group 7 (health). Cross-border assessment needed.
- **Data protection:** UK GDPR + Data Protection Act 2018. Post-Brexit, UK has its own data protection regime but it's substantively identical to EU GDPR. The UK has an EU adequacy decision (valid until June 2025, likely renewed). Standard Contractual Clauses (SCCs) may be needed if adequacy lapses. The International Data Transfer Agreement (IDTA) is the UK equivalent of SCCs.

### Actions
1. **Site:** Build out English landing page variant for UK market (current index.html already mostly English — adapt slightly)
2. **Pricing:** GBP pricing. £130–150 per session (reflects UK private therapy market: London average £60–120/session, premium analytic work £100–200+).
3. **Cal.com:** Create UK event type with GBP pricing via Stripe
4. **Legal pages:** Create UK-specific terms of service and privacy notice (UK GDPR references instead of DSGVO)
5. **E-signatures:** DocuSign works for UK (common law jurisdiction, electronic signatures valid under Electronic Communications Act 2000)
6. **Video:** RED Medical works internationally. Alternatively, UK clients may prefer Zoom (less regulated than DACH). Assess.
7. **Directories:** 
   - Psychology Today UK (psychologytoday.com/gb)
   - Counselling Directory (counselling-directory.org.uk)
   - BACP directory (if pursuing membership)
   - Private practice directories
8. **Professional membership:** Consider UKCP or BPC associate/overseas membership for credibility
9. **Insurance:** Confirm German PII covers international online clients or obtain UK-specific cover
10. **Marketing:** Google Ads UK, SEO for "psychoanalytic therapy online UK", "Lacanian analyst online"

### Risks
- UK market is competitive for online therapy (BetterHelp, Harley Therapy, individual practitioners)
- No statutory regulation means low barrier to entry but also low differentiation — the Lacanian/philosophical angle IS the differentiator
- Currency fluctuation (GBP/EUR) — Stripe handles conversion but affects effective revenue
- If UK adequacy decision lapses, additional data transfer mechanisms needed

---

## Phase 4: United States

### Timeline
12–18 months after launch. Requires the most preparation.

### Why USA
- Largest English-speaking market
- Strong demand for psychoanalytic work (NYC, LA, SF, academic centers)
- "Coaching" framing sidesteps most licensing requirements
- High willingness to pay ($150–300/session for private-pay therapy/coaching)
- coaching.html placeholder already exists in codebase

### Legal Requirements — THE CRITICAL DISTINCTION

#### Psychotherapy vs. Coaching
- **Psychotherapy** in the US is regulated state-by-state. Each state has its own licensing board (e.g., LMHC, LCSW, LMFT, Licensed Psychologist). A German HP-Psych license has NO reciprocity with any US state.
- **Coaching** is largely UNREGULATED in the US. No state currently requires a license to offer "coaching," "life coaching," "executive coaching," or "philosophical counseling."
- **THE LINE:** If you diagnose, treat, or claim to treat mental disorders, you're practicing psychotherapy (regulated). If you help clients with personal development, self-understanding, decision-making, or philosophical inquiry, you're coaching (unregulated).

#### Recommended Framing: "Psychoanalytic Coaching"
- Positions the work in the coaching/consulting space
- "Psychoanalytic" signals the theoretical orientation without claiming clinical licensure
- Avoids terms: "therapy," "therapist," "treatment," "patient," "diagnosis," "mental health treatment"
- Uses terms: "coaching," "consultation," "counseling" (careful — some states regulate "counseling"), "philosophical practice," "client"
- **State-specific risk:** A few states (e.g., Colorado, Vermont) have considered coaching regulation. Monitor legislative changes.

#### HIPAA
- **Not applicable** if operating as a coach (not a "covered entity" under HIPAA).
- If you accept insurance or bill as a healthcare provider, HIPAA applies. Private-pay coaching avoids this entirely.
- Even without HIPAA, best practice is to maintain confidentiality standards equivalent to HIPAA.

#### Corporate Structure
- **Recommended:** Do NOT form a US entity initially. Operate as a foreign sole proprietor providing cross-border services.
- **Tax:** US-Germany tax treaty (DBA) applies. Service income from coaching likely taxable only in Germany (under Article 14 — Independent Personal Services) if you have no "fixed base" in the US. File IRS Form W-8BEN with Stripe.
- **If revenue grows:** Consider forming an LLC in a favorable state (Wyoming or Delaware) for liability protection. Consult a cross-border tax advisor.
- **State nexus:** Providing online services to US clients may create "economic nexus" for state tax purposes in some states. Low risk at low volumes but monitor.

#### Consumer Protection
- **FTC Act:** No false advertising, no misleading claims about outcomes
- **CCPA (California):** If serving California residents, must provide CCPA notice (right to know, right to delete, right to opt out of sale). Threshold: $25M revenue or 50,000+ consumers — likely not triggered initially, but include a basic CCPA notice preemptively.
- **State consumer protection laws** vary. General rule: don't promise specific outcomes, don't claim to treat medical conditions.

### Actions
1. **Site:** Build out `coaching.html` with US-specific content
   - Title: "Psychoanalytic Coaching" (not "Psychotherapy")
   - Remove ALL references to: Heilpraktiker, psychotherapy, treatment, diagnosis, patients
   - Add: coaching-oriented language, client empowerment, personal development framing
   - Disclaimer: "This is not psychotherapy, medical treatment, or mental health counseling. Robert Rozek is not licensed as a healthcare provider in the United States."
2. **Pricing:** $150–200 USD per session (competitive for premium coaching; NYC/LA analytic sessions run $200–400)
3. **Cal.com:** Create US coaching event type with USD pricing
4. **Legal pages:** US terms of service, CCPA privacy notice, coaching disclaimer
5. **E-signatures:** DocuSign US endpoint (`na4.docusign.net`)
6. **Video:** RED Medical works internationally. Alternatively Zoom (more familiar to US clients). No HIPAA compliance needed for coaching.
7. **Payment:** Stripe US (already works, just needs USD event type)
8. **Marketing:**
   - Google Ads: "psychoanalytic coaching online," "Lacanian coaching," "philosophical counseling online"
   - Psychology Today (coaching section, not therapy section)
   - Niche: academic communities, philosophy departments, psychoanalytic institutes (NLS, WAP affiliates in the US)
   - Content marketing: articles on psychoanalysis + coaching, Substack, academic social media
9. **Tax:** File W-8BEN with Stripe. Consult cross-border tax advisor on treaty application.
10. **Insurance:** Confirm or obtain PII covering US clients. US litigation risk is higher.

### Risks
- **State licensing boards:** If a state board determines you're practicing therapy (not coaching), they can issue cease-and-desist. Mitigate with clear coaching framing and disclaimers.
- **Malpractice exposure:** US clients are more litigious. Ensure adequate insurance.
- **Marketing restrictions:** Can't use terms that imply healthcare licensure. No "treating anxiety/depression" — instead "working through existential questions, relational patterns, personal impasses."
- **Competition:** Saturated online coaching market. Differentiation through psychoanalytic/philosophical framing is key.

---

## Cross-Cutting Considerations

### Branding Strategy

| Market | Brand Framing | Title Used |
|--------|--------------|------------|
| Germany | Psychoanalytische Praxis / Psychotherapie | Heilpraktiker für Psychotherapie |
| Austria | Psychoanalytische Beratung | Psychologe (MSc), Berater |
| Switzerland | Psychoanalytische Beratung | Psychologe (MSc), Berater |
| UK | Psychoanalytic Counselling / Psychotherapy | Psychoanalytic Psychotherapist |
| USA | Psychoanalytic Coaching | Psychoanalytic Coach / Consultant |

### Pricing Summary

| Market | Currency | Price | Rationale |
|--------|----------|-------|-----------|
| Germany | EUR | €150 | Current price, competitive for HP-Psych online |
| Austria | EUR | €150 | Same currency, similar market |
| Switzerland | CHF | 160–180 | PPP adjustment, higher cost of living |
| UK | GBP | £130–150 | Premium positioning, below London in-person rates |
| USA | USD | $150–200 | Competitive for premium coaching |

### Technical Changes Per Phase

| Component | Phase 1 (DE) | Phase 2 (DACH) | Phase 3 (UK) | Phase 4 (US) |
|-----------|-------------|----------------|-------------|-------------|
| **Landing page** | index.html (fix issues) | Add AT/CH disclaimers | UK variant or shared English page | coaching.html build-out |
| **Cal.com** | Fix price, add free consult | Add CHF event type | Add GBP event type | Add USD coaching event type |
| **Stripe** | EUR (current) | + CHF | + GBP | + USD |
| **E-sign provider** | DocuSign EU or OpenAPI | Same | DocuSign (shared) | DocuSign US endpoint |
| **Video** | RED Medical | RED Medical | RED Medical or Zoom | RED Medical or Zoom |
| **Privacy policy** | Fix gaps (see audit) | Minor additions | UK GDPR variant | US privacy + CCPA notice |
| **Legal pages** | Fix Impressum | Add AT/CH disclaimers | UK terms of service | US coaching disclaimer + terms |
| **Cookie banner** | Fix language | Same | Adapt for UK (ICO guidance) | Simpler (no GDPR, but CCPA) |
| **Intake docs** | DE + EN (current) | Same | EN (current) | US-specific coaching agreement |
| **Domain** | praxis-site-vert.vercel.app → custom | Same | Same or .co.uk | Same or .com |

### Revenue Projections (Conservative)

| Phase | Timeline | Clients/Week | Revenue/Month | Cumulative Annual |
|-------|----------|-------------|---------------|-------------------|
| Phase 1 (DE) | Months 1–6 | 5–10 | €3,000–6,000 | €36,000–72,000 |
| Phase 2 (DACH) | Months 4–12 | +3–5 | +€1,800–3,000 | +€21,600–36,000 |
| Phase 3 (UK) | Months 8–18 | +3–5 | +£1,560–3,000 | +£18,720–36,000 |
| Phase 4 (US) | Months 14–24 | +5–10 | +$3,000–8,000 | +$36,000–96,000 |

*Assumes 4 sessions/month per regular client, 80% retention after first 3 months.*

---

## Decision Points & Dependencies

### Before Phase 2
- [ ] Phase 1 site audit issues resolved
- [ ] At least 3 regular German clients established
- [ ] Legal opinion on Austrian LSB / cross-border exemption obtained
- [ ] Swiss bilateral agreement assessment completed
- [ ] CHF pricing and Cal.com event type created

### Before Phase 3
- [ ] DACH client base established (at least 2 regular DACH clients outside Germany)
- [ ] UK GDPR compliance reviewed (adequacy decision status checked)
- [ ] UK professional indemnity insurance arranged
- [ ] GBP pricing and Cal.com event type created
- [ ] UK-specific legal pages drafted
- [ ] Optional: UKCP/BPC membership application submitted

### Before Phase 4
- [ ] UK market tested for at least 3 months
- [ ] US coaching framing reviewed by US attorney (optional but recommended)
- [ ] W-8BEN filed with Stripe
- [ ] US-specific intake documents (coaching agreement, not clinical intake) created
- [ ] CCPA privacy notice drafted
- [ ] coaching.html fully built and tested
- [ ] USD pricing and Cal.com event type created
- [ ] US professional liability insurance obtained
- [ ] Marketing strategy for US niche audiences defined

---

## Appendix: Useful Contacts & Resources

### Professional Associations
- **Germany:** DGPT (Deutsche Gesellschaft für Psychoanalyse, Psychotherapie, Psychosomatik und Tiefenpsychologie), DPV, DPG
- **Austria:** ÖPG (Österreichische Psychoanalytische Gesellschaft), WPV (Wiener Psychoanalytische Vereinigung)
- **Switzerland:** SGPsa (Schweizerische Gesellschaft für Psychoanalyse)
- **UK:** BPC (British Psychoanalytic Council), UKCP, IPA (International Psychoanalytical Association)
- **USA:** APsaA (American Psychoanalytic Association), NLS, WAP, NPAP (National Psychological Association for Psychoanalysis)

### Lacanian-Specific Networks
- **NLS** (New Lacanian School) — European, English-language
- **WAP** (World Association of Psychoanalysis) — Jacques-Alain Miller's network
- **CFAR** (Centre for Freudian Analysis and Research) — London
- **Après-Coup Psychoanalytic Association** — NYC
- **San Francisco Society for Lacanian Studies**

### Regulatory Bodies
- **Germany:** Gesundheitsamt München (HP license), BayLDA (data protection)
- **Austria:** Bundesministerium für Soziales, Gesundheit, Pflege und Konsumentenschutz (psychotherapy registry)
- **Switzerland:** BAG (Bundesamt für Gesundheit), cantonal health departments
- **UK:** HCPC (protected titles only), ICO (data protection)
- **USA:** State licensing boards (per state), FTC (advertising), state AG offices (consumer protection)

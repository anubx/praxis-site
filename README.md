# Psychoanalytic Practice — Landing Page

Static site for Vercel. No build step — just HTML/CSS/JS.

## Deploy

```bash
vercel
# Or connect the GitHub repo to Vercel dashboard
```

## File Map — What to Edit

| File | What it contains | When to edit |
|---|---|---|
| `public/index.html` | Main landing page (cal.com embed) | Bio text, pricing, tracking IDs, styling |
| `public/datenschutz.html` | Privacy policy (DSGVO) | Data processing details, tool changes |
| `public/impressum.html` | Legal notice (§ 5 TMG) | Address, credentials, authority |
| `public/docs/*.pdf` | Client documents (4 EN + 4 DE) | Regenerate via `generate_client_docs.py` |
| `vercel.json` | Routing, headers, redirects | New routes, security headers |

### Common edits

- **Change session price**: search `CHF 150` in index.html + regenerate PDFs
- **Change bio/about text**: edit the `<section id="about">` block in index.html
- **Change cal.com link**: search `YOUR-CAL-USERNAME/30min` in index.html (4 occurrences — nav, hero, pricing, CTA)
- **Update tracking IDs**: search `G-PJGQ4RBY5R` (GA4), `vnzaph1mar` (Clarity), `AW-` (Ads)
- **Update address/email**: search `Augsburgerstraße 6` and `rozek.therapy@pm.me`

### Placeholders still remaining

| Placeholder | File(s) | Status |
|---|---|---|
| `YOUR-CAL-USERNAME/30min` | `index.html` (4 places) | Replace with your cal.com booking slug |
| `AW-XXXXXXXXX` | `index.html` | Commented out — uncomment when Google Ads campaign is created |
| `CONVERSION_LABEL` | `index.html` | Set after creating Ads conversion action |

## Decision Log

### 2026-02-28 — Stack: Cal.com + Stripe + RED Medical (replacing multi-platform A/B)

**Decision**: Consolidate to a single booking flow — Cal.com embedded on the landing page, Stripe for prepayment, RED Medical for video sessions. Removed It's Complicated, Doctolib, and RED Medical booking variants.

**Reasoning**:
- Cal.com embeds as an inline modal — visitor never leaves the page (lowest friction)
- Cal.com has native Stripe integration for prepayment — no custom payment code needed
- RED Medical (RED connect plus) is KBV-certified, DSGVO-compliant, peer-to-peer encrypted, and works worldwide with no IP restrictions
- Single page to maintain instead of three A/B variants — simpler, less error-prone
- It's Complicated / Doctolib were middlemen adding friction; cal.com gives full ownership of the booking flow
- A/B testing is no longer needed for platform selection — can still A/B test copy/design via Google Ads experiments

**Trade-off**: Lose It's Complicated directory listing for organic discovery. Mitigated by Google Ads being the primary acquisition channel.

### 2026-02-28 — RED Medical: Internationally Legal

**Decision**: Use RED Medical (RED connect plus) for all video sessions, including international clients.

**Reasoning**: RED connect plus works worldwide with no IP or geographic restrictions. End-to-end encrypted peer-to-peer connections. Certified for German Heilpraktiker use (Anlage 31b BMV-Ä). As a Heilpraktiker für Psychotherapie (not GKV-billed), there are no KV billing constraints limiting international use.

### 2026-02-28 — BetterHelp Ratings: Do Not Display

**Decision**: Do not embed BetterHelp ratings/reviews on the landing page.

**Reasoning**: FTC Consumer Review Rule exposure — using reviews from one platform to market services on another could trigger enforcement (up to $53k/violation). BetterHelp ToS also restricts repurposing their content.

### 2026-02-28 — LegitScript Certification: Not Required

**Decision**: Skip LegitScript certification for now.

**Reasoning**: LegitScript is required by Google/Meta only for addiction treatment advertising. Psychoanalytic counseling/psychotherapy (Heilpraktiker) does not fall under this restriction. Can advertise in all target markets without it.

### 2026-02-28 — London Ltd Structure: Not Viable

**Decision**: Do not operate the Munich practice through a London Ltd.

**Reasoning**: Permanent establishment rules would trigger German corporate taxation (~29-33%) regardless of the UK entity. No meaningful tax benefit, added compliance burden with dual-jurisdiction filings.

## Structure

```
public/
  index.html       — Main landing page (cal.com embed + tracking)
  datenschutz.html — Privacy policy (DSGVO)
  impressum.html   — Legal notice (TMG)
  docs/            — Client PDFs (4 EN + 4 DE)
vercel.json        — Vercel routing + headers
```

## Stack

- **Scheduling**: Cal.com (embedded modal on page)
- **Payment**: Stripe (via cal.com native integration)
- **Video**: RED Medical — RED connect plus (peer-to-peer, E2E encrypted)
- **Analytics**: GA4 (G-PJGQ4RBY5R) + Microsoft Clarity (vnzaph1mar)
- **Ads**: Google Ads (pending campaign creation)
- **Hosting**: Vercel (static, no build step)
- **E-signatures**: Dropbox Sign (for client documents)

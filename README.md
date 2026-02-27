# Psychoanalytic Practice — Landing Page

Static site for Vercel. No build step — just HTML/CSS/JS.

## Deploy

```bash
# From this directory:
vercel
# Or connect the GitHub repo to Vercel dashboard
```

## Placeholders to replace

Search the codebase for these and swap in your real values:

| Placeholder | File(s) | What it is |
|---|---|---|
| `YOUR-PROFILE` | `index.html` | Your It's Complicated profile slug |
| `YOUR_ID` | `index.html` | Your Google Scholar user ID |
| `G-XXXXXXXXXX` | `index.html` | GA4 Measurement ID |
| `AW-XXXXXXXXX` | `index.html` | Google Ads account ID (uncomment when ready) |
| `CONVERSION_LABEL` | `index.html` | Google Ads conversion label |
| `CLARITY_PROJECT_ID` | `index.html` | Microsoft Clarity project ID |
| `your@email.com` | `index.html`, `datenschutz.html` | Contact email |
| `[Your Street Address]` | `datenschutz.html`, `impressum.html` | Practice address |
| `[Postcode City, Country]` | `datenschutz.html`, `impressum.html` | City/postcode |
| `[Your City/District]` | `impressum.html` | Gesundheitsamt jurisdiction |
| `[University Name]` | `impressum.html` | MSc-granting university |

## Structure

```
public/
  index.html        — Main landing page
  datenschutz.html   — Privacy policy (DSGVO)
  impressum.html     — Legal notice (TMG)
vercel.json          — Vercel routing + headers
```

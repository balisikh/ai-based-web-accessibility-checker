# Lumen — Portfolio Documentation

**AI-Based Web Accessibility Checker**

Repository: https://github.com/balisikh/ai-based-web-accessibility-checker  
Local app: http://localhost:4376

> Assistive findings only — this tool is **not** a legal accessibility certificate or formal conformance audit.

---

## Overview

Lumen scans a public URL for WCAG-oriented accessibility issues, returns a clear score, severity breakdown, and links to rule help. Optional AI tips suggest fixes for top issues.

### What it does

1. Paste a public website URL
2. Lumen opens the page in a headless browser (Chrome via Playwright)
3. **axe-core** checks WCAG A/AA-oriented rules
4. You get a **score**, severity breakdown, and issue details
5. Optionally, **AI tips** explain top issues and suggest fixes
6. Export a **JSON** report

### Stack

- **Frontend / API:** Next.js (React) + TypeScript
- **Scanner:** Playwright (Chrome) + axe-core
- **Data:** Postgres or PGlite
- **AI (optional):** OpenAI-compatible Chat Completions API

---

## UI screenshots (styled layout)

### Home — accessibility checker

![Lumen home — accessibility checker](screenshots/home-desktop.png)

### Batch results — 28 public websites

![Website batch pass/fail dashboard](screenshots/batch-desktop.png)

### Results — sample scan layout

![Scan results with score and issues](screenshots/results-desktop.png)

### Mobile home (390px)

![Lumen home on a phone-width viewport](screenshots/home-mobile.png)

---

## Layout (light mode)

| Element | Description |
|---------|-------------|
| **Header** | Sticky bar — Lumen logo, Checker / Batch results pills, Light / Dark / System theme |
| **Background** | Soft grey gradient with subtle grid pattern |
| **Main card** | White rounded panel with teal gradient strip along the top |
| **Home CTA** | Orange **Check accessibility** button |
| **Batch CTA** | Teal **Run a live scan** button (top right on desktop) |

---

## Batch snapshot (2026-07-30)

Static dashboard at `/batch` — loads instantly; does not run live scans.

| Metric | Value |
|--------|------:|
| Websites tested | **28** |
| **Passed** | **8** (4 clean · 4 with issues) |
| **Failed** | **20** |
| Total issues | **374** |

### Pass / Fail rule

| Result | Rule |
|--------|------|
| **Pass** | Score **≥ 85** and Critical issues **= 0** |
| **Fail** | Score **< 85** or Critical issues **≥ 1** |

### Sites that passed

Google UK, BBC iPlayer, BBC News, Disney+ UK, GitHub (balisikh), Google Maps, Wikipedia (en Main Page), example.com

### Severity totals (all 28 scans)

| Critical | Serious | Moderate | Minor |
|---------:|--------:|---------:|------:|
| 144 | 37 | 188 | 5 |

---

## MVP features

| Area | Status |
|------|--------|
| Scan UI (home → progress → results) | Done |
| Live Playwright + axe-core analysis | Done |
| URL validation + SSRF protections | Done |
| Per-IP rate limiting | Done |
| Persistence (Postgres or local PGlite) | Done |
| JSON export | Done |
| Optional AI enrichment | Done |
| Anonymous use (no login) | Done |
| PDF export / accounts / crawl | Not yet |

---

## Quick start

```bash
cd web
npm install
npm run dev
```

Open **http://localhost:4376**

On memory-limited Windows machines:

```powershell
npm run build:low-mem
npm run start:low-mem
```

---

## Disclaimer

Lumen helps teams find and understand accessibility issues faster. It does **not** replace a professional audit, and results should not be treated as legal proof of WCAG conformance.

---

*Document generated from project README and demo screenshots in `docs/screenshots/`.*

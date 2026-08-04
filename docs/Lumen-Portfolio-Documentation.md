# Lumen — Portfolio Documentation

AI-Based Web Accessibility Checker

Repository: https://github.com/balisikh/ai-based-web-accessibility-checker  
Local app: http://localhost:4376  
Document date: **2026-08-04**

> Assistive findings only — this tool is **not** a legal accessibility certificate or formal conformance audit.

---

## Overview

Lumen scans a public URL for WCAG-oriented accessibility issues, returns a clear score, severity breakdown, and links to rule help. Optional AI tips suggest fixes for top issues. A separate **batch dashboard** shows Pass/Fail results for 28 well-known public websites.

### What it does (end-to-end)

1. Paste a public website URL on the home page
2. Lumen opens the page in a headless browser (Chrome via Playwright)
3. **axe-core** checks WCAG A/AA-oriented rules
4. You get a **score**, severity breakdown, and issue details
5. Optionally, **AI tips** explain top issues and suggest fixes
6. Export a **JSON** report

### Technology stack

| Layer | Technology |
|-------|------------|
| Frontend / API | Next.js 16 (React) + TypeScript |
| Scanner | Playwright (Chrome) + axe-core |
| Data | Postgres or local PGlite |
| AI (optional) | OpenAI-compatible Chat Completions API |
| CI/CD | GitHub Actions, Docker, GHCR |

---

## UI screenshots (styled layout)

<!-- SCREENSHOTS -->

---

## Batch snapshot (2026-08-04)

Static dashboard at `/batch` — loads instantly from committed or live JSON data.

| Metric | Value |
|--------|------:|
| Websites tested | **28** |
| **Passed** | **8** (4 clean · 4 with issues) |
| **Failed** | **20** |
| Total issues | **330** |
| Last live refresh | **28/28 OK** (~88 seconds, parallel background job) |

### Pass / Fail rule

| Result | Rule |
|--------|------|
| **Pass** | Score **≥ 85** and Critical issues **= 0** |
| **Fail** | Score **< 85** or Critical issues **≥ 1** |

### Severity totals (all 28 scans)

| Critical | Serious | Moderate | Minor |
|---------:|--------:|---------:|------:|
| 46 | 37 | 217 | 30 |

---

## Feature reference

Each feature below follows the same structure: **what it is**, **why we use it**, **key purpose**, **how we implemented it**, and **how to use it**.

---

### 1. Live URL scanning (Playwright + axe-core)

| | |
|---|---|
| **What it is** | A real browser scan of one public URL. Playwright launches headless Chrome, loads the page, and axe-core runs WCAG 2.x A/AA tagged rules. |
| **Why we use it** | Static HTML checks miss client-rendered content. axe-core is industry-standard for automated accessibility testing and maps to WCAG success criteria. |
| **Key purpose** | Give developers a fast, trustworthy signal on real page behaviour — not just source code. |
| **How we implemented it** | `web/src/lib/live-scan.ts` — shared browser instance, navigation fallbacks (`domcontentloaded` → `load` → `commit`), axe tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`. Violations mapped in `axe-mapper.ts`. Pipeline wired from `POST /api/scans`. |
| **How to use it** | Home page → paste URL → **Check accessibility**. Progress shows fetching → rendering → rule analysis. Results appear when complete. |

---

### 2. Scan workflow UI (home → progress → results)

| | |
|---|---|
| **What it is** | The main user journey: URL input, live progress, score panel, issue list, and detail view. |
| **Why we use it** | Scanning can take 10–60 seconds. Clear states reduce anxiety and match the “fast first report” product goal. |
| **Key purpose** | Make accessibility checking feel simple for non-experts while still showing enough detail for developers. |
| **How we implemented it** | `ScanExperience.tsx` (client) polls `GET /api/scans/:id`. Server components pass batch snapshot context. Copy from `how-to-use.ts` and `product-copy.ts`. Fixture route `/fixtures/results` for layout QA without live scans. |
| **How to use it** | Open `/`. Enter a URL or click a **Try example** chip. Watch progress. Click an issue for rule help and (if enabled) AI tips. |

---

### 3. Scoring and Pass / Fail rules

| | |
|---|---|
| **What it is** | A 0–100 score derived from issue severities, plus a binary Pass/Fail gate for the batch dashboard. |
| **Why we use it** | Teams need one number for triage and a clear portfolio benchmark across 28 sites. |
| **Key purpose** | Deterministic scoring (rules find issues; score is formula-based, not AI-generated). |
| **How we implemented it** | `store.ts` — `scoreFromIssues()`, `countBySeverity()`. Pass rule in `website-pass-fail.ts`: Pass if score ≥ 85 **and** critical = 0. Documented in `product-copy.ts` and home FAQs. |
| **How to use it** | Results panel shows score + severity chips. Batch table shows Pass/Fail per site. Hover or read **Common questions** on home for the full rule. |

---

### 4. URL validation and SSRF protection

| | |
|---|---|
| **What it is** | Server-side checks that block scanning of private networks, localhost, and non-public hosts. |
| **Why we use it** | Without this, a scanner could be abused to probe internal IPs (SSRF). |
| **Key purpose** | Security by default — only public web pages are allowed. |
| **How we implemented it** | `ssrf.ts` — hostname blocklist, DNS resolve, reject private/reserved IP ranges. Called from `live-scan.ts` before navigation. User-facing errors in FAQs (`home-faqs.ts`). |
| **How to use it** | Use normal `https://` public URLs. Localhost and `192.168.x.x` are rejected with a clear message. |

---

### 5. Rate limiting (live scans and batch refresh)

| | |
|---|---|
| **What it is** | Per-IP limits on how often clients can start expensive operations. |
| **Why we use it** | Playwright scans are CPU/RAM heavy. Limits prevent abuse and keep the app responsive for everyone. |
| **Key purpose** | Protect the server without requiring user accounts. |
| **How we implemented it** | `rate-limit.ts` — in-memory sliding window. `POST /api/scans`: default 5/min (production). Batch refresh: `batch-refresh-config.ts` — 5 per 10 min locally, 1/hour in production CI hosts. Returns **429** + `Retry-After`. |
| **How to use it** | If you hit the limit, wait for the retry time shown. Override via `RATE_LIMIT_MAX`, `BATCH_REFRESH_RATE_LIMIT_*` in `.env.local` for self-hosted setups. |

---

### 6. Persistence (PGlite and Postgres)

| | |
|---|---|
| **What it is** | Scan records and issues stored in a database so results survive page reloads and server restarts. |
| **Key purpose** | Shareable scan URLs, JSON export, and audit trail without login. |
| **Why we use it** | In-memory-only storage would lose data on every deploy; Postgres is needed for production. |
| **How we implemented it** | `db/` schema + async scan store. Default: **PGlite** at `web/data/lumen-pg`. Production: set `DATABASE_URL` for Postgres. Health check at `GET /api/health`. |
| **How to use it** | No setup locally — PGlite creates files automatically. For production, set `DATABASE_URL` in host env (see `web/DEPLOY.md`). |

---

### 7. JSON export

| | |
|---|---|
| **What it is** | Download of the full scan report as structured JSON. |
| **Why we use it** | Developers and QA tools need machine-readable output for tickets, CI, or archival. |
| **Key purpose** | Primary MVP export format (PDF export is roadmap). |
| **How we implemented it** | `GET /api/scans/:id/export?format=json` — issues, score, metadata. UI button on results panel. |
| **How to use it** | After a scan completes → **Export JSON** on the results view. |

---

### 8. Optional AI tips

| | |
|---|---|
| **What it is** | LLM-generated explanation and suggested fix for the top N issues by severity. |
| **Why we use it** | axe tells you *what* failed; AI helps explain *why it matters* and *how to fix it* for developers who are new to a11y. |
| **Key purpose** | Hybrid detection: rules find issues; AI enriches — scoring stays deterministic. |
| **How we implemented it** | `ai-enrichment.ts` — OpenAI-compatible API. Env: `AI_API_KEY` / `OPENAI_API_KEY`, `AI_MODEL`, `AI_MAX_ISSUES`. Failures never block the report. `GET /api/config` exposes `aiTipsEnabled` without secrets. |
| **How to use it** | Add key to `web/.env.local`, restart server. Top issues show **AI tip** sections when enabled. |

---

### 9. Batch results dashboard (28 sites)

| | |
|---|---|
| **What it is** | A pre-built Pass/Fail table for 28 public websites (Google, BBC, Netflix, W3Schools, etc.). |
| **Why we use it** | Demonstrates Lumen on real-world pages instantly — no waiting for 28 live scans on every visit. |
| **Key purpose** | Portfolio proof and regression benchmark across diverse site types (SPAs, media, e-commerce, docs). |
| **How we implemented it** | `website-batch-results.ts` — committed snapshot. `/batch` page renders summary tiles + sortable table. Fail guidance in `website-batch-fail-guidance.ts`. Unified date via `getBatchSnapshot()` in `batch-snapshot-store.ts`. |
| **How to use it** | Nav → **Batch results**. Review Pass/Fail, scores, severities. Click **Run a live scan** to test your own URL. |

---

### 10. Refresh snapshot (background batch rescan)

| | |
|---|---|
| **What it is** | A button on `/batch` that live-rescans all 28 sites and saves a runtime JSON snapshot. |
| **Why we use it** | Keeps the dashboard up to date without a manual CLI run or waiting for weekly CI. |
| **Key purpose** | Fast refresh (~under 2 minutes) without blocking the rest of the app. |
| **How we implemented it** | `POST /api/batch/refresh` → **202 Accepted**, background job in `batch-refresh-job.ts`. Parallel rescans (`BATCH_RESCAN_CONCURRENCY=2`) in `batch-live-rescan.ts`. Per-site 90s timeout. Progress polling via `GET /api/batch/refresh`. UI: `BatchRefreshButton.tsx` shows `Scanning SiteName (N/28)…`. Saves `web/data/batch-live-snapshot.json`. Enabled in dev or with `BATCH_REFRESH_ENABLED=1`. |
| **How to use it** | `/batch` → **Refresh snapshot**. Watch progress. Page reloads when done. Tune speed via `.env.local` (see `web/README.md`). |

---

### 11. Batch sync CLI and weekly CI rescan

| | |
|---|---|
| **What it is** | Automated pipeline to rescan all 28 sites and commit updated scores to git. |
| **Why we use it** | Deployed sites read committed TypeScript data — runtime JSON alone does not survive fresh deploys. |
| **Key purpose** | Keep production and git in sync with real-world site changes over time. |
| **How we implemented it** | `npm run batch:sync` = `batch:rescan` → `batch:apply-rescan` → `validate:batch`. GitHub Actions: `.github/workflows/batch-rescan.yml` — Sunday 04:00 UTC + manual dispatch; commits `website-batch-results.ts` when changed. |
| **How to use it** | Local: `cd web && npm run batch:sync`, then commit. CI: Actions → **Batch rescan** → Run workflow. |

---

### 12. Theme system (Light / Dark / System)

| | |
|---|---|
| **What it is** | User-selectable colour theme with system preference detection. |
| **Why we use it** | Accessibility tools should respect user contrast preferences; dark mode reduces eye strain for long review sessions. |
| **Key purpose** | WCAG-aligned product UI — the checker itself should be usable. |
| **How we implemented it** | CSS variables in `globals.css` — `[data-theme="light"]`, `dark`, system via `prefers-color-scheme`. Theme toggle in header. Batch page uses readable table/card styles in both themes. |
| **How to use it** | Header → **Light**, **Dark**, or **System**. Preference persists in `localStorage`. |

---

### 13. Responsive layout and viewport CI

| | |
|---|---|
| **What it is** | Layout adapts from mobile (320px) to desktop (1440px+) with device-tier gutters and breakpoints. |
| **Why we use it** | Teams review scans on phones and tablets; overflow bugs break real usage. |
| **Key purpose** | One codebase, five layout tiers — mobile cards, tablet batch cards, laptop/desktop tables. |
| **How we implemented it** | Breakpoint tokens in `globals.css` (`--bp-mobile` 480, `--bp-tablet` 768, `--bp-laptop` 1024, `--bp-desktop` 1440). `npm run test:responsive` — Playwright checks overflow at 320, 390, 768, 1024, 1280, 1440 on `/`, `/batch`, `/fixtures/results`. CI job **responsive-viewport**. |
| **How to use it** | Resize browser or use DevTools device mode. CI runs automatically on push to `main`. |

---

### 14. SEO (search visibility)

| | |
|---|---|
| **What it is** | Metadata, sitemap, robots.txt, Open Graph, and JSON-LD for public deployment. |
| **Why we use it** | Portfolio and product discoverability when deployed to a public URL. |
| **Key purpose** | Correct canonical URLs, social previews, and crawler guidance. |
| **How we implemented it** | `seo.ts`, `layout.tsx` metadata, `/sitemap.xml`, `/robots.txt`, `/icon.svg`. Requires `NEXT_PUBLIC_SITE_URL` in production (`web/DEPLOY.md`). |
| **How to use it** | Set `NEXT_PUBLIC_SITE_URL` on deploy. Submit sitemap in Google Search Console. |

---

### 15. Continuous integration (GitHub Actions)

| | |
|---|---|
| **What it is** | Automated checks on every push/PR to `main`. |
| **Why we use it** | Catch lint, type, build, and snapshot regressions before merge. |
| **Key purpose** | Confidence that production build and batch data stay valid. |
| **How we implemented it** | `.github/workflows/ci.yml` — ESLint, `typecheck:scripts`, `validate:copy`, `validate:batch`, `next build`, responsive viewport job. Badge in root README. |
| **How to use it** | `cd web && npm run ci` locally before push. Fix any red checks in Actions tab. |

---

### 16. Continuous deployment (Docker + GHCR)

| | |
|---|---|
| **What it is** | Docker image build and push after CI passes on `main`. |
| **Why we use it** | Playwright needs a worker-capable host with Chrome — container standardizes deploy. |
| **Key purpose** | Repeatable production deploy path. |
| **How we implemented it** | `web/Dockerfile`, `.github/workflows/cd.yml` → GHCR `ghcr.io/<owner>/lumen-web`. Optional `RENDER_DEPLOY_HOOK` secret. Documented in `web/DEPLOY.md`. |
| **How to use it** | Configure host secrets (`DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, optional AI key). Pull image or connect deploy hook. |

---

### 17. Centralized product copy

| | |
|---|---|
| **What it is** | Single source of truth for UI strings, FAQs, Pass/Fail rule, and disclaimers. |
| **Why we use it** | Prevents README and UI drift; FAQs stay consistent across home and docs. |
| **Key purpose** | Maintainability — change copy once, validate everywhere. |
| **How we implemented it** | `product-copy.ts`, `how-to-use.ts`, `home-faqs.ts`, `try-examples.ts`. `npm run validate:copy` fails CI if README duplicates in-app steps/FAQs. |
| **How to use it** | Edit copy in `web/src/lib/`. Run `npm run validate:copy`. Do not duplicate long FAQ text in README. |

---

### 18. Demo mode (no browser)

| | |
|---|---|
| **What it is** | Pre-canned scan findings without Playwright or network access. |
| **Why we use it** | CI, low-RAM machines, or demos when Chrome is unavailable. |
| **Key purpose** | UI development and testing without live scans. |
| **How we implemented it** | `USE_DEMO_SCAN=1` env flag — sample issues returned instead of `live-scan.ts`. |
| **How to use it** | `$env:USE_DEMO_SCAN="1"; npm run dev` (PowerShell) or `USE_DEMO_SCAN=1 npm run dev`. |

---

### 19. Local development tooling

| | |
|---|---|
| **What it is** | Scripts and defaults for stable development on Windows and low-RAM machines. |
| **Why we use it** | Next.js 16 Turbopack could crash compiling large `globals.css` on low memory, leaving unstyled HTML. |
| **Key purpose** | Reliable local demos for portfolio and interviews. |
| **How we implemented it** | Webpack forced via `--webpack` on `dev`/`build`. `start-local.ps1`, `fix-styles.ps1`, `build:low-mem` / `start:low-mem` (2 GB heap). Troubleshooting in `web/README.md`. |
| **How to use it** | If page shows plain white text: `cd web; .\scripts\fix-styles.ps1`. For production-like local: `npm run build:low-mem && npm run start:low-mem`. |

---

## MVP feature checklist

| Area | Status |
|------|--------|
| Scan UI (home → progress → results) | Done |
| Live Playwright + axe-core analysis | Done |
| URL validation + SSRF protections | Done |
| Per-IP rate limiting | Done |
| Persistence (Postgres or PGlite) | Done |
| JSON export | Done |
| Optional AI enrichment | Done |
| Anonymous use (no login) | Done |
| Batch dashboard (28 sites) | Done |
| Refresh snapshot (background) | Done |
| Weekly CI batch rescan | Done |
| Responsive layout + viewport CI | Done |
| SEO (sitemap, OG, JSON-LD) | Done |
| Docker + CD workflow | Done |
| PDF export / accounts / multi-page crawl | Not yet |

---

## Quick start

```bash
cd web
npm install
npm run dev
```

Open **http://localhost:4376**

On memory-limited Windows:

```powershell
npm run build:low-mem
npm run start:low-mem
```

Enable batch refresh locally (`.env.local`):

```env
BATCH_REFRESH_ENABLED=1
```

---

## Local development note — plain-text UI incident (Aug 2026)

During local testing, the app briefly appeared as **unstyled plain text** (nav labels run together). The design was **not removed** — CSS failed to load from a stale `.next` build.

**Fix:** webpack by default, `fix-styles.ps1`, confirm CSS **200** in DevTools → Network. After clean rebuild, UI matched screenshots again.

---

## Disclaimer

Lumen helps teams find and understand accessibility issues faster. It does **not** replace a professional audit, and results should not be treated as legal proof of WCAG conformance.

---

*Generated from project source, README, and screenshots in `docs/screenshots/`.*

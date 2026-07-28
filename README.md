# Lumen — AI-Based Web Accessibility Checker

Scan a public URL for WCAG-oriented accessibility issues, get a clear score, and (optionally) AI-guided fix tips.

**Live product UI brand:** Lumen  
**App code:** [`web/`](./web)  
**Repository:** [github.com/balisikh/ai-based-web-accessibility-checker](https://github.com/balisikh/ai-based-web-accessibility-checker)

> Assistive findings only — this tool is **not** a legal accessibility certificate or formal conformance audit.

---

## What it does

1. You paste a public website URL  
2. Lumen opens the page in a headless browser (Chrome via Playwright)  
3. **axe-core** checks WCAG A/AA-oriented rules  
4. You get a **score**, severity breakdown, and issue details  
5. Optionally, **AI tips** explain top issues and suggest fixes  
6. Export a **JSON** report  

---

## Features (current MVP)

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
| PDF export / accounts / crawl / deploy | Not yet |

---

## Quick start

### Requirements

- **Node.js 20+**
- **Google Chrome** installed (used for live page scans)
- npm

### Install & run

```bash
cd web
npm install
cp .env.example .env.local   # optional — edit as needed
npm run dev
```

Open **http://localhost:4376**

#### Windows (PowerShell) note

If `npm install` fails because drive C: is full, point the cache elsewhere:

```powershell
npm install --cache "D:\npm-cache"
```

#### Demo mode (no Chrome / no live fetch)

```powershell
$env:USE_DEMO_SCAN="1"
npm run dev
```

```bash
USE_DEMO_SCAN=1 npm run dev
```

---

## How to use

The home screen includes a **How to use Lumen** section (backed by [`web/src/lib/how-to-use.ts`](./web/src/lib/how-to-use.ts)). Keep it aligned with this list:

1. Open the app and enter a public `https://` URL (for example `https://example.com`)  
2. Click **Check accessibility**  
3. Wait for status steps (fetch → render → rules → optional AI → score)  
4. Review the score and issue list; open an issue for WCAG refs, snippet, and AI tips (if enabled)  
5. Click **Export JSON** to download the report  

Private/local addresses (for example `localhost`, `127.0.0.1`) are blocked on purpose.

---

## Optional configuration

Copy [`web/.env.example`](./web/.env.example) to `web/.env.local`:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Use real Postgres. If unset, local **PGlite** files are used under `web/data/lumen-pg` |
| `RATE_LIMIT_MAX` | Max scans per IP per window (default `5`) |
| `RATE_LIMIT_WINDOW_MS` | Window length in ms (default `60000`) |
| `AI_API_KEY` or `OPENAI_API_KEY` | Enable AI tips for top issues |
| `AI_MODEL` | Model name (default `gpt-4o-mini`) |
| `AI_MAX_ISSUES` | How many top issues to enrich (default `5`) |
| `USE_DEMO_SCAN=1` | Sample findings instead of live Playwright/axe |

Full details: [`web/README.md`](./web/README.md)

---

## Continuous integration (GitHub Actions)

On every push and pull request to **`main`**, [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) runs:

| Job | What it checks |
|-----|----------------|
| **web** | `npm ci` → ESLint → **batch snapshot validation** (28 sites, scores, totals, fail guidance) → `next build` |
| **smoke-scan** | Playwright **Chromium** live scan of `https://example.com` (bundled browser on CI, not system Chrome) |

Run the same checks locally:

```bash
cd web
npm run ci              # lint + validate:batch + build
npm run validate:batch  # snapshot only
npm run smoke:scan      # optional live scan (needs Chrome locally, or PLAYWRIGHT_CHROMIUM=1 + playwright install chromium)
```

The full **28-site batch rescan** is intentionally **not** in CI (slow and flaky). Update [`web/src/lib/website-batch-results.ts`](./web/src/lib/website-batch-results.ts) after manual rescans; CI keeps that file internally consistent.

---

## Continuous deployment (CD)

After **CI passes on `main`**, [`.github/workflows/cd.yml`](./.github/workflows/cd.yml) builds a Docker image and pushes to **GHCR** (`ghcr.io/<owner>/lumen-web`). Optionally set GitHub secret **`RENDER_DEPLOY_HOOK`** to auto-trigger Render.

Details: [`web/DEPLOY.md`](./web/DEPLOY.md) · image: `ghcr.io/<owner>/<repo>:latest` · local: `docker build -f web/Dockerfile web`

**AI tips locally:** copy [`web/.env.example`](./web/.env.example) to `web/.env.local`, set `OPENAI_API_KEY`, restart `npm run dev`. Never commit `.env.local`.

---

## Stack

- **Frontend / API:** Next.js (React) + TypeScript  
- **Scanner:** Playwright (Chrome) + axe-core  
- **Data:** Postgres or PGlite  
- **AI (optional):** OpenAI-compatible Chat Completions API  

Locked MVP decisions: [`MVP_DECISIONS.md`](./MVP_DECISIONS.md)

---

## Project docs

| Doc | Purpose |
|-----|---------|
| [`PRODUCT_BRIEF.md`](./PRODUCT_BRIEF.md) | Product brief |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Architecture outline |
| [`MVP_DECISIONS.md`](./MVP_DECISIONS.md) | Locked defaults |
| [`MVP_CHECKLIST.md`](./MVP_CHECKLIST.md) | Build checklist |
| [`WIREFRAMES.md`](./WIREFRAMES.md) | Screen wireframes |
| [`TEST_PLAN.md`](./TEST_PLAN.md) | Manual test plan (multi-site scans) |
| [`TEST_RESULTS.md`](./TEST_RESULTS.md) | Website Pass/Fail results log |
| [`web/README.md`](./web/README.md) | App setup, env, pipeline |

---

## API (MVP)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/scans` | Start a scan `{ "url": "https://..." }` |
| `GET` | `/api/scans/:id` | Status, score, summary |
| `GET` | `/api/scans/:id/issues` | Issue list |
| `GET` | `/api/scans/:id/export?format=json` | Download report |
| `GET` | `/api/health` | Health + DB/AI flags |

---

## Roadmap (next)

1. Deploy to a worker-capable host (Chrome/Playwright) — **Docker + CD workflow in repo**; wire host secrets  
2. PDF export  
3. Accounts + scan history  
4. Multi-page crawl · optional scheduled batch rescan in CI  

---

## Disclaimer

Lumen helps teams find and understand accessibility issues faster. It does **not** replace a professional audit, and results should not be treated as legal proof of WCAG conformance.

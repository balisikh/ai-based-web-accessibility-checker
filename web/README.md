# Lumen (web app)

[![CI status](https://github.com/balisikh/ai-based-web-accessibility-checker/actions/workflows/ci.yml/badge.svg)](https://github.com/balisikh/ai-based-web-accessibility-checker/actions/workflows/ci.yml)

Next.js app for **Lumen** — scan any public page for WCAG accessibility issues, with optional AI fix guidance. Stack: Playwright + axe-core.

For the project overview and quick start, see the [root README](../README.md).

## Scripts

```bash
npm run dev    # local development → http://localhost:4376 (webpack — see troubleshooting)
npm run build  # production build (webpack)
npm run start  # run production server
npm run lint   # eslint
npm run ci     # lint + typecheck:scripts + validate:copy + validate:batch + build
npm run typecheck:scripts   # TypeScript for scripts/ only (also run in GitHub CI)
npm run test:responsive   # needs npm run start in another terminal
```

**CI vs app build:** `npm run build` typechecks `src/` only (`scripts/` is excluded from the main `tsconfig.json`). Maintenance scripts are checked separately via `npm run typecheck:scripts` (uses `tsconfig.scripts.json`, including DOM types for Playwright browser callbacks and shared `src/lib` imports) — same split as GitHub Actions.

**Windows (low RAM):** `.\scripts\start-local.ps1` — builds once if needed, then `start:low-mem`.  
**Plain white text / no layout?** `.\scripts\fix-styles.ps1` — stops stale server, deletes broken `.next`, rebuilds, restarts.

## Troubleshooting: page looks like plain text (no colours / layout)

The HTML is fine; **CSS did not compile or load**. Common on low-memory Windows machines.

**Cause:** Next.js 16 defaults to **Turbopack**, which can crash while processing `src/app/globals.css` (~2.4k lines + Tailwind v4). The server may still respond with unstyled HTML (`LLumenCheckerBatch results…`).

**Fix:**

1. Stop any old server (Ctrl+C in the terminal).
2. Delete a broken build if present: remove the `web/.next` folder.
3. Start with **webpack** (all `dev` / `build` scripts in this repo now pass `--webpack`):

```powershell
cd web
npm run build:low-mem
npm run start:low-mem
```

Or for development:

```powershell
npm run dev
```

4. Open **http://localhost:4376** (not `https`) and hard-refresh (**Ctrl+F5**).
5. In DevTools → **Network**, reload — you should see a `.css` file with status **200**. If it is red/404, the build failed; close other apps and rebuild.

**Do not** open `docs/Lumen-Portfolio-Documentation.html` or `.md` in the browser expecting the live app — use localhost for the styled UI.

Deploy: see [DEPLOY.md](./DEPLOY.md) (Docker + GitHub CD workflow).

## Updating the batch snapshot (latest live rescan date)

Home and `/batch` read the same snapshot via `getBatchSnapshot()` — committed [`website-batch-results.ts`](./src/lib/website-batch-results.ts) by default, or runtime JSON after a live refresh.

### Refresh snapshot button (`/batch`)

There is a **Refresh snapshot** button in the batch page header (next to **Run a live scan**). It calls `POST /api/batch/refresh`, rescans all 28 sites, saves `data/batch-live-snapshot.json`, and reloads the page.

Enabled in `next dev`, or production with `BATCH_REFRESH_ENABLED=1`. Otherwise the button explains that sync comes from git / CI.

Refresh runs as a **background job** (POST returns immediately; the button polls progress). The rest of the app stays usable. Tune speed vs memory with `BATCH_RESCAN_CONCURRENCY` (default 2) and `BATCH_RESCAN_SITE_TIMEOUT_MS` (default 90s per site). Local rate limit defaults to **5 per 10 minutes** when refresh is enabled outside CI (override with `BATCH_REFRESH_RATE_LIMIT_*`).

Read status without rescanning: `GET /api/batch/snapshot` → `{ date, meta, summary, source }`.

### Manual sync (committed — survives deploys)

```powershell
cd web
npm run batch:sync   # rescan → apply → validate
git add src/lib/website-batch-results.ts
git commit -m "chore: sync batch snapshot"
git push
```

Or: `batch:rescan` → `batch:apply-rescan` → `validate:batch`. Update [`TEST_RESULTS.md`](../TEST_RESULTS.md) if you keep that log in sync.

### Scheduled CI rescan (weekly)

[`.github/workflows/batch-rescan.yml`](../.github/workflows/batch-rescan.yml) — **Sunday 04:00 UTC** and **workflow_dispatch**: runs `batch:sync`, commits `website-batch-results.ts` if changed, pushes to `main`.

User-facing copy lives in `src/lib/` — [`product-copy.ts`](./src/lib/product-copy.ts), [`how-to-use.ts`](./src/lib/how-to-use.ts), [`home-faqs.ts`](./src/lib/home-faqs.ts). README points there; `npm run validate:copy` enforces no duplication.

## Responsive layout

Content is capped at **1100px** with **device-tier** gutters and breakpoints.

| Device | Viewport (typical) | Layout |
|--------|-------------------|--------|
| **Mobile** | ≤480px | Single column, 44px touch targets, tight gutters |
| **Tablet** | 481–768px | Batch **cards**, full-width scan button, 2×2 summary tiles |
| **Tablet landscape** | 769–1024px | Batch **table** (compact), 2×2 summaries, balanced results columns |
| **Laptop** | 1025–1439px | Full 4-column batch summaries, results list + detail |
| **Desktop** | ≥1440px | Same max width, wider side margins, extra vertical rhythm |

**Breakpoint tokens:** `--bp-mobile` 480 · `--bp-tablet` 768 · `--bp-stack` 800 · `--bp-laptop` 1024 · `--bp-desktop` 1440.

**QA widths (CI):** 320, 390, 768, 1024, 1280, 1440 on `/`, `/batch`, `/fixtures/results`.

```bash
npm run build && npm run start
# other terminal:
npm run test:responsive
```

CI runs the same check after build. Viewport: `layout.tsx` — zoom allowed.

## Requirements

- Node.js 22+ (GitHub Actions CI uses 22)
- Google Chrome (live scans use Playwright `channel: "chrome"`)

## Environment

Copy `.env.example` to `.env.local` and adjust:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Real Postgres URL. If unset → **PGlite** in `./data/lumen-pg` |
| `PGLITE_DATA_DIR` | Optional custom PGlite path |
| `RATE_LIMIT_MAX` | Max `POST /api/scans` per IP per window (default **5** in production, **120** in `next dev` if unset) |
| `RATE_LIMIT_WINDOW_MS` | Window length in ms (default `60000`) |
| `AI_API_KEY` / `OPENAI_API_KEY` | Enables AI tips for top issues |
| `AI_BASE_URL` | OpenAI-compatible API base (default `https://api.openai.com/v1`) |
| `AI_MODEL` | Model name (default `gpt-4o-mini`) |
| `AI_MAX_ISSUES` | Top issues to enrich (default `5`) |
| `USE_DEMO_SCAN=1` | Sample findings instead of Playwright/axe |
| `SCAN_WORKER_URL` | Vercel UI: origin of Docker scan worker (hybrid deploy — see [DEPLOY.md](./DEPLOY.md#vercel-ui--docker-scan-worker-hybrid)) |
| `SCAN_WORKER_SECRET` | Shared Bearer secret between Vercel and worker |
| `BATCH_REFRESH_ENABLED=1` | Enable **Refresh snapshot** on `/batch` in production (`POST /api/batch/refresh`) |

### Examples

```bash
# Live scan + local PGlite
npm run dev

# Demo findings (no browser)
USE_DEMO_SCAN=1 npm run dev
```

PowerShell:

```powershell
$env:USE_DEMO_SCAN="1"; npm run dev
```

## Scan pipeline

1. Rate limit check  
2. Validate URL + block private hosts  
3. DNS resolve + reject private IPs  
4. Playwright (Chrome) renders the page  
5. axe-core runs WCAG A/AA tagged rules  
6. Optional AI enrichment (if API key set; failures never block the report)  
7. Persist issues + score  

## Persistence

- **Local default:** PGlite under `data/lumen-pg` (survives restarts)  
- **Production:** set `DATABASE_URL`  

## Rate limiting

`POST /api/scans` is limited per client IP. Over limit → **429** + `Retry-After`.

## AI tips

With `AI_API_KEY` (or `OPENAI_API_KEY`) set in **`.env.local`** (local) or host env (production), top issues by severity get explanation + suggested fix in the results panel. Without a key, axe results still work. Restart the dev server after changing env.

`GET /api/config` returns `{ "aiTipsEnabled": true | false }` for the home UI (no secrets).

# Deploying Lumen (CD)

Continuous deployment runs after **CI succeeds on `main`** ([`.github/workflows/cd.yml`](../.github/workflows/cd.yml)), or manually via **Actions → CD → Run workflow**.

## What CD does today

1. **Builds** the Docker image from [`web/Dockerfile`](./Dockerfile) (Next.js standalone + Playwright Chromium).
2. **Pushes** to GitHub Container Registry:
   - `ghcr.io/<owner>/lumen-web:latest`
   - `ghcr.io/<owner>/lumen-web:<git-sha>`
3. **Optionally** POSTs to **Render** if you set `RENDER_DEPLOY_HOOK` in GitHub repository secrets.

Other hosts (Railway, Fly.io, Azure Container Apps) can pull the same GHCR image or run `docker build -f web/Dockerfile web`.

## Render (optional)

1. Create a **Web Service** → Deploy from **Docker** → use GHCR image or connect repo with root directory `web` and Dockerfile path `Dockerfile`.
2. Set **port** `4376` (or set `PORT` env to what Render assigns and map accordingly).
3. Add environment variables (see below).
4. Copy the **Deploy Hook** URL into GitHub → Settings → Secrets → `RENDER_DEPLOY_HOOK`.

## Required / recommended environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Production Postgres (recommended). Without it, PGlite uses disk on the container — **ephemeral** on many PaaS hosts. |
| `PLAYWRIGHT_CHROMIUM` | Set to `1` in Docker (already in Dockerfile). |
| `RATE_LIMIT_MAX` / `RATE_LIMIT_WINDOW_MS` | Tune scan rate limits. |
| `OPENAI_API_KEY` or `AI_API_KEY` | Enable AI tips on the server. |
| `AI_MODEL`, `AI_BASE_URL`, `AI_MAX_ISSUES` | Optional AI tuning. |
| `NEXT_PUBLIC_SITE_URL` | **Production:** full public URL (e.g. `https://lumen.example.com`) for canonical links, Open Graph, `sitemap.xml`, and `robots.txt`. Without it, metadata defaults to `localhost:4376`. |

Do **not** commit secrets. Use the host dashboard or GitHub Actions secrets.

## SEO (search visibility)

Set **`NEXT_PUBLIC_SITE_URL`** to your deployed origin (no trailing path). Lumen then serves:

| Route | Purpose |
|-------|---------|
| `/sitemap.xml` | Home + batch pages for crawlers |
| `/robots.txt` | Allows `/`, disallows `/api/` and `/fixtures/` |
| Per-page `<link rel="canonical">` | Avoids duplicate URL issues |
| Open Graph + Twitter cards | Uses `/og.png` for link previews |
| JSON-LD (`WebApplication`, `WebSite`, batch breadcrumbs) | Rich results context |

After deploy, verify in [Google Search Console](https://search.google.com/search-console) (submit sitemap) and test previews with [opengraph.xyz](https://www.opengraph.xyz/) or similar.

## Local Docker smoke test

```bash
cd web
docker build -t lumen-web:local .
docker run --rm -p 4376:4376 -e PLAYWRIGHT_CHROMIUM=1 lumen-web:local
```

Open http://localhost:4376

For AI tips locally, use [`web/.env.local`](./.env.local) with `npm run dev` instead of Docker, or pass `-e OPENAI_API_KEY=...` to `docker run` (never commit the key).

## Data and persistence

- **PGlite** (`web/data/lumen-pg`) works for demos; mount a volume or use **Postgres** in production.
- Scan URLs and JSON exports may contain sensitive query strings — treat the DB as confidential.

## Manual deploy without GitHub CD

```bash
docker build -t ghcr.io/<owner>/lumen-web:latest -f web/Dockerfile web
docker push ghcr.io/<owner>/lumen-web:latest
```

Then redeploy your service to pull the new tag.

## Vercel: fix `404 NOT_FOUND` on every route

If you see Vercel’s plain **`404: NOT_FOUND`** page (with `Code: NOT_FOUND` and an ID like `lhr1::…`) on **all** URLs, the project is not building the Next.js app in **`web/`**.

**This is a Next.js App Router app — not a Vite/CRA SPA.** There is no `index.html` and you must **not** add SPA rewrites to `index.html`. Vercel runs `next build` and serves routes from `.next/` (e.g. `/` → `src/app/page.tsx`).

### Choose ONE root-directory setup (do not mix)

| Root Directory in Vercel | Config file used |
|--------------------------|------------------|
| **`web`** (recommended) | [`web/vercel.json`](./vercel.json) |
| **`.`** (repo root) | [`../vercel.json`](../vercel.json) (builds `web/package.json` with `@vercel/next`) |

### Required project settings

In **Vercel → Project → Settings → Build and Deployment**:

| Setting | Must be |
|---------|---------|
| **Root Directory** | **`web`** *or* **`.`** — match the table above |
| **Framework Preset** | **Next.js** (not **Other**) |
| **Output Directory** | **empty** — never `dist`, `build`, `out`, or `.next` |
| **Build Command** | `npm run build` (default, or from `vercel.json`) |

Then **Deployments → Redeploy → Clear build cache**.

Also:

- **Delete** duplicate project `ai-based-web-accessibility-checker-jjq5` (failed twin deploys).
- **Settings → Deployment Protection** → **Off** for Production (otherwise login/404 for visitors).

### Confirm the build worked

Build logs must include **`Detected Next.js`**, **`Running "npm run build"`**, and a **route list** (`/`, `/batch`, `/api/health`, …). A build that finishes in under a second means the wrong folder is still selected.

### Still broken?

1. Delete the Vercel project and re-import from GitHub.
2. On import, set **Root Directory = `web`** before the first deploy.
3. After the home page loads, add env vars for [hybrid scans](#vercel-ui--docker-scan-worker-hybrid) and redeploy.

The repo includes [`web/vercel.json`](./vercel.json) so Vercel treats this folder as Next.js. That file is **ignored** if Root Directory points at the repo root — use root [`vercel.json`](../vercel.json) instead.

---

## Vercel UI + Docker scan worker (hybrid)

Use this when the **public site** is on [Vercel](https://vercel.com) but **real scans** need Playwright in a container (Render, Railway, Fly, etc.). The Vercel app serves pages and API routes that read/write **shared Postgres**; live browser work runs on the worker.

```
Visitor → your-project.vercel.app
            POST /api/scans → saves scan (queued) in Neon
                         → POST worker /api/worker/scans/:id/run (secret)
            GET  /api/scans/:id  → polls Neon until completed

Worker  → lumen-worker.onrender.com (Docker)
            runLiveScan() with Playwright + axe-core
            writes results to same Neon DATABASE_URL
```

### 1. Postgres (required for hybrid)

Create a database ([Neon](https://neon.tech), Vercel Postgres, Supabase, etc.) and copy **`DATABASE_URL`**. Use the **same** URL on Vercel and on the worker.

PGlite does not persist on Vercel — do not rely on it for hybrid deploys.

### 2. Scan worker (Docker / Render)

Deploy the same repo with [`web/Dockerfile`](./Dockerfile) (see [Render](#render-optional) above).

| Variable | Worker value |
|----------|----------------|
| `DATABASE_URL` | Shared Postgres URL |
| `PLAYWRIGHT_CHROMIUM` | `1` (set in Dockerfile) |
| `SCAN_WORKER_SECRET` | Long random string — **same value on Vercel** |
| `OPENAI_API_KEY` / `AI_API_KEY` | Optional — AI runs on worker during scan |
| `SCAN_WORKER_URL` | **Leave unset** on the worker |

Note the worker’s public URL, e.g. `https://lumen-worker.onrender.com`.

### 3. Vercel project

1. **Add New Project** → import repo → **Root Directory:** `web`.
2. **Environment variables** (Production + Preview):

| Variable | Vercel value |
|----------|----------------|
| `DATABASE_URL` | Same Postgres URL as worker |
| `SCAN_WORKER_URL` | Worker origin, no trailing slash |
| `SCAN_WORKER_SECRET` | Same secret as worker |
| `NEXT_PUBLIC_SITE_URL` | `https://your-project.vercel.app` (or custom domain later) |
| `RATE_LIMIT_MAX` | e.g. `5` |

**Do not set** `SCAN_WORKER_URL` on Vercel to itself. **Do not enable** `BATCH_REFRESH_ENABLED` on Vercel (batch refresh needs long Playwright jobs on the worker host).

3. Deploy. Use the `*.vercel.app` URL first — **do not move DNS** from an existing production host until scans are verified.

**If the site loads only for you (SSO login) or fails in embedded browsers:** Vercel → **Settings → Deployment Protection** → set Production to **Standard Protection** off, or enable **Public** access for the production domain so visitors are not redirected to Vercel SSO.

### 4. Verify

| Check | Expected |
|-------|----------|
| `GET /api/health` on Vercel | `"scanExecution": "worker_proxy"`, `"db": "postgres"` |
| `GET /api/health` on worker | `"scanExecution": "local"`, `"db": "postgres"` |
| Home → scan `https://example.com` | Completes with real score |
| Export JSON | Works from Vercel (reads Neon) |
| Export PDF | Proxied to worker Playwright |

### 5. Safe rollout (no impact on existing site)

- Keep Render/CD and any current production URL unchanged.
- Vercel gets a **separate** `*.vercel.app` URL until you choose to switch DNS.
- Only point a custom domain at Vercel after hybrid scans pass on the preview URL.

### How it works in code

- When `SCAN_WORKER_URL` and `SCAN_WORKER_SECRET` are set, `POST /api/scans` calls [`triggerScanOnWorker`](./src/lib/scan-worker-client.ts) instead of local Playwright.
- The worker exposes `POST /api/worker/scans/:id/run` (Bearer auth) and runs [`runLiveScan`](./src/lib/scan-runner.ts).
- PDF export on Vercel proxies to the worker’s `GET /api/scans/:id/export?format=pdf`.

Single-host Docker deploy (no Vercel) is unchanged — leave `SCAN_WORKER_URL` unset and scans run locally.


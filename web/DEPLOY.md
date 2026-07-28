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

Do **not** commit secrets. Use the host dashboard or GitHub Actions secrets.

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

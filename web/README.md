# Lumen (web app)

Next.js application for the AI-Based Web Accessibility Checker.

For the project overview and quick start, see the [root README](../README.md).

## Scripts

```bash
npm run dev    # local development → http://localhost:4376
npm run build  # production build
npm run start  # run production server
npm run lint   # eslint
npm run ci     # lint + validate:batch + build
npm run test:responsive   # needs npm run start in another terminal
```

Deploy: see [DEPLOY.md](./DEPLOY.md) (Docker + GitHub CD workflow).

## Responsive layout

**Defaults:** max content **1100px** (`--content-max-width`); breakpoints **480 / 640 / 800 / 1024**.

| Width | Behavior |
|------:|----------|
| **480** | Full-width scan button, 44px touch targets |
| **640** | `/batch` table → **card list** |
| **800** | Stack results grid, URL row, how-it-works |
| **801–1024** | Slightly compact batch table (tablet / small laptop) |

**QA widths:** 320, 390, 768, 1024, 1280 px on `/` and `/batch`.

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

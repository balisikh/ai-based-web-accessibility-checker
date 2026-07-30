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

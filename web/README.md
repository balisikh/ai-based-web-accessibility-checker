# Lumen (web)

Next.js MVP for the AI-Based Web Accessibility Checker.

## Scripts

```bash
npm run dev    # local development
npm run build  # production build
npm run start  # run production server
npm run lint   # eslint
```

## Requirements for live scans

- **Google Chrome** installed (used via Playwright `channel: "chrome"`)
- Node.js 20+

> Playwright’s bundled Chromium download was skipped here because the system C: drive is full. The scanner uses your installed Chrome instead.

## Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Real Postgres connection string. If unset, uses **PGlite** (Postgres-compatible files in `./data/lumen-pg`) |
| `PGLITE_DATA_DIR` | Optional custom PGlite data path |
| `RATE_LIMIT_MAX` | Max `POST /api/scans` per IP per window (default `5`) |
| `RATE_LIMIT_WINDOW_MS` | Window length in ms (default `60000`) |
| `USE_DEMO_SCAN=1` | Sample findings instead of Playwright/axe |

```bash
# Live (default) — PGlite persistence on disk
npm run dev

# Demo fallback
$env:USE_DEMO_SCAN="1"; npm run dev
```

## Persistence

Scans and issues are stored in Postgres tables (`scans`, `issues`):
- **Local default:** PGlite under `web/data/lumen-pg` (survives restarts)
- **Production:** set `DATABASE_URL` to your Postgres instance

## Rate limiting

`POST /api/scans` is limited per client IP. Exceeding the limit returns **429** with `Retry-After`.

## Scan pipeline

1. Rate limit check  
2. Validate URL + block private hosts  
3. DNS resolve + reject private IPs  
4. Playwright (Chrome) renders the page  
5. axe-core runs WCAG A/AA tagged rules  
6. Persist issues + score  

AI enrichment is still optional / not required for MVP.

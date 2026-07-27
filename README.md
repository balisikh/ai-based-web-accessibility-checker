# AI-Based Web Accessibility Checker

Product docs live in the repo root. The runnable MVP shell is in [`web/`](./web).

## Locked MVP defaults

See [`MVP_DECISIONS.md`](./MVP_DECISIONS.md):

- TypeScript / Next.js / Playwright / axe-core
- Anonymous scans
- Optional AI enrichment
- Container + worker-capable hosting

## Run the app shell

```bash
cd web
npm install --cache "D:\npm-cache"
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> Note: If your C: drive is full, keep npm’s cache on D: (as above).

## What works now

- Home / Scan UI (brand **Lumen**)
- `POST /api/scans`, status, issues, JSON export, health
- URL validation + private-host blocking + DNS SSRF check
- **Live scans** via Playwright (installed Chrome) + axe-core WCAG A/AA rules
- **Rate limiting** on scan creation (per IP)
- **Postgres persistence** (`DATABASE_URL`) or local **PGlite** files under `web/data/`
- Optional `USE_DEMO_SCAN=1` for sample findings without a browser

## Docs

| Doc | Purpose |
|-----|---------|
| `PRODUCT_BRIEF.md` | Product brief |
| `ARCHITECTURE.md` | Architecture outline |
| `MVP_DECISIONS.md` | Locked defaults |
| `MVP_CHECKLIST.md` | Build checklist |
| `WIREFRAMES.md` | MVP screen wireframes |

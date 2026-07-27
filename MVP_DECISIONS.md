# MVP Decisions (Locked)

**Status:** Locked  
**Date:** July 2026  
**Aligned with:** `PRODUCT_BRIEF.md`, `ARCHITECTURE.md`

These defaults guide the MVP. Change only with an explicit decision update.

---

## Locked choices

| Decision | Choice | Notes |
|----------|--------|-------|
| **Stack** | TypeScript-first: **Next.js** + **Playwright** + **axe-core** | One language for UI and backend. Postgres + Redis when persistence/queue are needed; spike may start simpler. |
| **Auth** | **Anonymous scans** in MVP | No login required. Accounts/history come later. |
| **AI** | **Optional enrichment** | Core product ships on rule results (axe) + score. AI tips only when a provider API key is configured. AI failure must not block rule reports. |
| **Hosting** | **Container + worker-capable** | Runtime must support Playwright (memory/time). Prefer Railway, Render, Fly.io, or cloud containers—not UI-only serverless alone. |

---

## Implications for build

1. Scaffold a Next.js (TypeScript) app as the product shell.
2. Run scans via Playwright + axe-core (async worker pattern when moving past the spike).
3. Ship a usable URL → issues → score flow **without** auth or AI.
4. Add an AI adapter behind a feature flag / env key.
5. Target deployment on a platform that can run a headless browser worker.

---

## Explicitly deferred (not MVP)

- User accounts, teams, scan history
- Multi-page crawl
- CI/API keys
- Authenticated/staging target pages
- Conformance / certification claims

---

## Next recommended step

MVP checklist is in `MVP_CHECKLIST.md`. Next: technical spike or app scaffold.

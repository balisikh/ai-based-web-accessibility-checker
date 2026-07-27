# MVP Checklist

**Status:** Ready to build  
**Based on:** `PRODUCT_BRIEF.md`, `ARCHITECTURE.md`, `MVP_DECISIONS.md`  
**Date:** July 2026

**Done when:** A user can paste a public URL, get a WCAG-oriented issue list + score (from axe-core), and export JSON—without login. AI tips are optional if an API key exists.

---

## 1. Screens (UI)

| # | Screen | Must include | Done? |
|---|--------|--------------|-------|
| 1 | **Home / Scan** | Brand, URL field, “Check accessibility” CTA, short privacy note | ☑ |
| 2 | **Scanning** | Progress/status (queued → analyzing → scoring), cancel optional | ☑ |
| 3 | **Results summary** | Score, counts by severity, scanned URL, timestamp | ☑ |
| 4 | **Issue list + detail** | Filter by severity; each issue: message, WCAG refs, selector/snippet, help link; optional AI tip panel | ☑ |
| 5 | **Export** | Download JSON (PDF can be Phase 1.1) | ☑ |
| 6 | **Error states** | Invalid URL, unreachable site, timeout, blocked host | ☑ (invalid + blocked host; live unreachable/timeout after real fetch) |

UI itself should aim for WCAG 2.2 AA (keyboard, labels, contrast, focus).

---

## 2. API endpoints

| Method | Path | Purpose | Done? |
|--------|------|---------|-------|
| `POST` | `/api/scans` | Body `{ url }` → `{ scanId }` | ☑ |
| `GET` | `/api/scans/:id` | Status, score, summary counts | ☑ |
| `GET` | `/api/scans/:id/issues` | Issue list (optional `?severity=`) | ☑ |
| `GET` | `/api/scans/:id/export?format=json` | Machine-readable report | ☑ |
| `GET` | `/api/health` | Liveness | ☑ |

---

## 3. Backend / worker capabilities

| Capability | Requirement | Done? |
|------------|-------------|-------|
| URL validation | `http`/`https` only; basic format checks | ☑ |
| SSRF protection | Block private/link-local/metadata IPs | ☑ hostname + DNS private-IP check |
| Page render | Playwright loads page (timeout bounded) | ☑ (system Chrome channel) |
| Rule analysis | axe-core run → normalized issues | ☑ |
| Scoring | Deterministic score from severities | ☑ |
| WCAG mapping | Criteria IDs + severity on each issue | ☑ |
| Job lifecycle | `queued → … → completed \| failed` | ☑ |
| AI enrichment (optional) | If `AI_API_KEY` set, enrich top-N issues; never block rules | ☐ placeholder stage only |
| Persistence | In-memory OK for spike; Postgres for real MVP | ☑ Postgres via `DATABASE_URL`, else PGlite files |

---

## 4. Non-functional (MVP bar)

| Item | Bar | Done? |
|------|-----|-------|
| Time to report | Aim &lt; 2 minutes for a typical public page | ☐ |
| Rate limiting | Basic per-IP limit on `POST /api/scans` | ☑ |
| Secrets | Env-based config; no keys in repo | ☑ |
| Accessibility of product UI | Pass basic keyboard + label + contrast checks | ☐ |
| Disclaimer | Report is assistive, not a legal certificate | ☑ |

---

## 5. Explicitly out of MVP

- Login / accounts / history  
- Multi-page crawl  
- PDF export (nice-to-have after JSON)  
- CI integration  
- Authenticated target sites  
- Auto-fixing customer code  

---

## 6. Suggested build order

1. Next.js app shell + Home/Scan screen  
2. `POST/GET` scan APIs with fake/in-memory completed scan (UI wiring)  
3. Playwright + axe worker path (real analysis)  
4. Results UI (summary + issues)  
5. JSON export + error states  
6. SSRF + rate limit hardening  
7. Optional AI enrichment adapter  

---

## 7. Acceptance scenarios

- [ ] Scanning `https://example.com` returns a score and at least a structured issue list (may be empty if clean).  
- [ ] Invalid URL is rejected with a clear error.  
- [ ] Private/local targets (e.g. `http://127.0.0.1`) are rejected.  
- [ ] JSON export downloads and matches on-screen issues.  
- [ ] Without AI key, full rule report still works.  
- [ ] With AI key, at least one issue can show an explanation/fix tip.

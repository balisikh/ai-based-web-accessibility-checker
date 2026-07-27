# Architecture Outline: AI-Based Web Accessibility Checker

**Version:** 1.0  
**Status:** Proposed (MVP-first)  
**Aligned with:** `PRODUCT_BRIEF.md`  
**Date:** July 2026

---

## 1. Architecture Goals

| Goal | Implication |
|------|-------------|
| Fast first report (< ~2 min) | Async scan pipeline + progressive results |
| Hybrid detection | Separate rule engine from AI enrichment |
| Actionable output | Structured issues + WCAG mapping + remediation |
| Secure by default | URL allow/deny, content retention limits, no secret leakage |
| Accessible product | The app UI itself targets WCAG 2.2 AA |
| Extensible | Add crawl, CI, auth pages without redesigning core |

**Guiding principle:** Rules find and locate issues; AI explains and suggests fixes. Scoring stays deterministic.

---

## 2. System Context

```
┌─────────────┐     HTTPS      ┌──────────────────────────────┐
│  Web Client │ ◄────────────► │  Accessibility Checker API   │
│  (Browser)  │                │  + Scan Orchestrator         │
└─────────────┘                └──────────────┬───────────────┘
                                              │
              ┌───────────────────────────────┼───────────────────────────────┐
              │                               │                               │
              ▼                               ▼                               ▼
     ┌────────────────┐            ┌──────────────────┐            ┌────────────────┐
     │ Headless Browser│            │ Rule Engine      │            │ AI Enrichment  │
     │ (page render)   │            │ (axe-core style) │            │ (LLM provider) │
     └────────┬───────┘            └────────┬─────────┘            └────────┬───────┘
              │                               │                               │
              └───────────────────────────────┼───────────────────────────────┘
                                              ▼
                                   ┌──────────────────┐
                                   │ Data Store       │
                                   │ scans / issues   │
                                   └──────────────────┘

External targets: customer websites (fetched/rendered)
Optional later: CI systems, browser extension, team IdP
```

**Actors**
- End user (developer, designer, QA, compliance)
- System admin (ops)
- External website under test
- LLM provider
- (Later) CI runner via API key

---

## 3. High-Level Style

**Recommended for MVP:** Modular monolith with clear bounded modules and an async job worker.

Why:
- Fewer moving parts than microservices for a small team
- Clear module boundaries so crawl/CI/AI can grow later
- One deployable API + one worker process is enough for MVP load

**Evolution path:** Extract `Scan Worker`, `AI Enrichment`, and `Report Export` into separate services when volume or isolation requires it.

---

## 4. Logical Components

### 4.1 Presentation Layer
- **Web App (SPA or SSR)** — URL input, scan status, results, issue detail, export
- Must itself be keyboard accessible, properly labeled, high contrast

### 4.2 API Gateway / Backend API
Responsibilities:
- Validate scan requests (URL format, scheme, size limits)
- Create scan jobs; return `scanId`
- Poll/stream scan status and results
- Serve report export endpoints
- Auth (optional in MVP; recommended early for history)

### 4.3 Scan Orchestrator
State machine for a scan:

`queued → fetching → rendering → rule_analysis → ai_enrichment → scoring → completed | failed`

Owns retries, timeouts, and partial failure policy (e.g. rules succeed even if AI fails).

### 4.4 Page Acquisition Service
- Resolve URL (HTTP/HTTPS only)
- SSRF protections (block private IPs, metadata endpoints, link-local)
- Fetch HTML and related assets as needed
- Render with **headless browser** for JS-heavy SPAs
- Capture: DOM snapshot, accessibility tree (if available), screenshots (optional), console errors (optional)

### 4.5 Rule Analysis Engine
- Run deterministic accessibility checks (prefer **axe-core** or equivalent)
- Normalize findings into internal `Issue` model
- Map each rule → WCAG criterion IDs, severity, selector, snippet, help URL

### 4.6 AI Enrichment Service
Inputs (bounded context, not full site dump):
- Issue type + WCAG refs
- Element HTML snippet / accessible name
- Nearby text / link purpose context
- Optional image description metadata

Outputs:
- Plain-language explanation
- Suggested remediation (content and/or code)
- Optional content-quality flags (weak alt, vague link text)
- Confidence score for AI-only judgments

**Hard rule:** AI must not invent DOM evidence. Suggestions are grounded in captured snippets.

### 4.7 Scoring & Aggregation
- Compute page score from weighted severities
- Deduplicate overlapping issues
- Group by category (perceivable, operable, understandable, robust)
- Produce summary counts for dashboard

### 4.8 Report / Export Service
- JSON report (machine-readable)
- PDF report (stakeholder-readable)
- Later: CSV, SARIF (for CI)

### 4.9 Persistence
Store:
- Scan metadata (URL, timestamps, status, score)
- Issues (normalized)
- AI enrichment payloads
- Export artifacts (or regenerate on demand)

---

## 5. End-to-End Data Flow (MVP)

```
1. User submits URL
2. API validates URL → creates Scan(queued) → returns scanId
3. Worker picks job
4. Page Acquisition fetches/renders page → stores DOM snapshot reference
5. Rule Engine analyzes DOM → writes Issue[] (rules)
6. AI Enrichment enriches top-N issues (by severity) → writes explanations/fixes
7. Scoring computes score + summary
8. Scan marked completed
9. Client polls GET /scans/:id → renders report
10. User exports PDF/JSON
```

**Progressive UX (recommended):** Show rule findings as soon as step 5 completes; stream AI tips as they arrive.

---

## 6. Core Domain Model

```
Scan
  id, url, status, createdAt, completedAt
  score, summaryCounts
  wcagLevelTarget (e.g. AA)
  errorMessage?

Issue
  id, scanId
  source: rule | ai
  ruleId?, wcagCriteria[]
  severity: critical | serious | moderate | minor
  impact, category
  selector, htmlSnippet, message
  helpUrl?
  aiExplanation?, aiRemediation?, aiConfidence?
  status: open | ignored | resolved (later)

ReportExport
  id, scanId, format: json | pdf
  createdAt, storageUri?
```

---

## 7. Suggested API Surface (MVP)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/scans` | Create scan `{ url }` → `{ scanId }` |
| `GET` | `/api/scans/:id` | Status + summary + score |
| `GET` | `/api/scans/:id/issues` | Paginated issues (filter by severity) |
| `GET` | `/api/scans/:id/export?format=json\|pdf` | Download report |
| `GET` | `/api/health` | Liveness |

Later:
- `POST /api/scans` with `{ urls[] }` or crawl config
- `POST /api/v1/ci/scan` with API key
- Auth: `POST /api/auth/...`, user scan history routes

---

## 8. Recommended Technology Stack (indicative)

| Layer | MVP suggestion | Notes |
|-------|----------------|-------|
| Frontend | Next.js (React) or similar | SSR helps SEO/marketing; app routes for scanner UI |
| API | Node.js (Nest/Fastify/Express) or Python (FastAPI) | Pick one primary language for speed |
| Queue/jobs | Redis + BullMQ (Node) or Celery/RQ (Python) | Async scans |
| Browser | Playwright | Strong SPA rendering + screenshots |
| Rules | axe-core (via Playwright) | Industry-standard automated checks |
| AI | OpenAI / Azure OpenAI / Anthropic via adapter | Swap providers behind interface |
| DB | PostgreSQL | Scans, issues, users |
| Object storage | S3-compatible (optional MVP) | DOM snapshots, PDFs |
| PDF | Server-side template → PDF library | Keep layout simple |

**MVP lean option:** One Node.js/TypeScript codebase:
- Next.js UI + API routes **or** Next.js UI + separate Fastify API
- Playwright + axe-core worker
- Postgres + Redis

---

## 9. Module Boundaries (code structure)

```
apps/
  web/                 # UI
  api/                 # HTTP API (if separate)
  worker/              # scan jobs
packages/
  domain/              # Issue/Scan types, scoring
  rules-adapter/       # axe → Issue normalizer
  ai-adapter/          # LLM client + prompts
  page-acquisition/    # Playwright fetch/render
  reporting/           # JSON/PDF builders
```

Contracts between modules should be typed DTOs—not raw axe or LLM JSON leaking into the UI.

---

## 10. Security Architecture

| Concern | Control |
|---------|---------|
| SSRF | Allow only `http/https`; DNS resolve + block private/link-local/metadata IPs; timeout; size caps |
| Abuse | Rate limit scans per IP/user; max concurrent jobs |
| Content privacy | Retention policy (e.g. auto-delete snapshots after N days); optional no-store mode |
| AI data | Send minimal snippets only; redact secrets patterns where possible |
| Auth (post-MVP) | Session/JWT; API keys hashed; least privilege |
| Supply chain | Pin browser + axe versions; sandbox worker |

---

## 11. Reliability & Performance

- **Timeouts:** fetch, render, axe, AI each bounded
- **Degradation:** If AI provider fails, return rule results + “AI unavailable” on enrichments
- **Idempotency:** scanId unique; worker safe retries
- **Caching (later):** cache repeated scans of unchanged pages by content hash
- **Concurrency:** worker pool sized to Playwright memory cost (browser is the bottleneck)

---

## 12. Observability

Track per scan:
- Stage durations (fetch, render, rules, AI, score)
- Issue counts by severity/source
- AI token usage / cost
- Failure reasons (timeout, blocked host, render error)

Alerts on: queue depth, worker crashes, AI error rate, elevated scan failure rate.

---

## 13. Deployment Topology (MVP)

```
Internet
   │
   ▼
[ HTTPS Load Balancer / Platform ]
   │
   ├── Web + API (container or serverless)
   ├── Worker (container; Playwright deps)
   ├── PostgreSQL
   └── Redis
```

Host on a platform that supports long-running workers (containers), not only short serverless functions—Playwright needs memory and time.

---

## 14. Phased Architecture Roadmap

| Phase | Architecture additions |
|-------|------------------------|
| **MVP** | Modular monolith, single-page scan, axe + AI enrich, Postgres, Redis queue, JSON/PDF |
| **Phase 2** | Crawl controller, scan history UI, ignore list, better SPA waits, artifact storage |
| **Phase 3** | Public API keys, CI webhook/SARIF, team accounts, authenticated target scanning (credentials vault) |
| **Scale** | Split worker fleet, dedicated AI service, CDN for reports, multi-region if needed |

---

## 15. Key Design Decisions (proposed defaults)

1. **Async scans** over synchronous request/response for analysis  
2. **axe-core + Playwright** as the rule/render foundation  
3. **AI enrichment optional path** that cannot block core rule results  
4. **PostgreSQL** as system of record  
5. **Modular monolith first**, extract services later  
6. **No conformance certificate claims** in architecture or API responses—reports are assistive findings only  

---

## 16. Technical Decisions & Remaining Questions

**Locked for MVP** — see `MVP_DECISIONS.md`:
1. Stack: **TypeScript-first** (Next.js + Playwright + axe-core)  
2. Auth: **anonymous scans**  
3. AI: **optional enrichment** (rules-first)  
4. Hosting: **container + worker-capable** (Playwright-friendly)

Still open:
1. Exact AI provider (when enabling enrichment)  
2. Store full DOM snapshots vs issue-scoped snippets only?  
3. Specific host: Railway / Render / Fly.io / AWS / Azure / GCP?  
4. Next.js monolith (API routes + separate worker) vs split `web` / `api` / `worker` apps from day one?

---

## 17. Summary

```
Client → API → Queue → Worker
                      ├─ Playwright (render)
                      ├─ axe-core (rules → Issues)
                      ├─ LLM adapter (explain/fix)
                      └─ Scorer → Postgres
Client ← Report/Export ← API
```

Build the MVP around a reliable scan pipeline with strict security on outbound fetches, deterministic scoring, and AI as an enrichment layer—not as the sole source of truth.

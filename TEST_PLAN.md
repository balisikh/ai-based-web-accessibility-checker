# Test Plan — Lumen Accessibility Checker

**Product:** AI-Based Web Accessibility Checker (Lumen)  
**App URL (local):** http://localhost:4376  
**Scope:** Manual MVP verification (UI + live scans + API basics)  
**Date:** July 2026

> Automated axe findings are assistive only — not a legal WCAG certificate.

---

## Test plan overview

Use this table to track **Lumen tool** tests (UI, security, API) separately from **website** scans in [`TEST_RESULTS.md`](./TEST_RESULTS.md).

| Area | ID | What to test | Expected | Status | Notes |
|------|-----|--------------|----------|--------|-------|
| **Environment** | ENV-01 | Node 20+, Chrome installed, `npm run dev` on port **4376** | App loads | Manual | See §2 |
| **Environment** | ENV-02 | `GET /api/health` | `ok: true`, `db`, `ai` | Manual | |
| **Environment** | ENV-03 | Demo mode **off** (`USE_DEMO_SCAN` unset) | Live Playwright/axe scans | Manual | |
| **Multi-site** | WEB-01 | Scan public https URLs (log in results) | Results + scores in `TEST_RESULTS.md` | **Done (28)** | Target **27** met; **#28** W3Schools added |
| **Multi-site** | WEB-02 | Per-site Pass/Fail rule | Score ≥ 85 and critical = 0 → Pass | **Done (28)** | **8 Pass / 20 Fail** (resync 2026-07-28) |
| **Multi-site** | WEB-03 | example.com | Strong/clean score | **Done** | #26 Pass (86) |
| **Multi-site** | WEB-04 | W3C bad demo | Many issues / low score | **Done** | #27 Fail (0) |
| **UI** | UI-01 | Homepage load | Brand, URL field, Check, chips | Manual | |
| **UI** | UI-02 | Example chip | Fills example.com URL | Manual | |
| **UI** | UI-03 | W3C chip | Fills W3C bad demo URL | Manual | |
| **UI** | UI-04 | Checking screen | Progress + checklist | Manual | |
| **UI** | UI-05 | Back to home (while checking) | Returns to homepage | Manual | |
| **UI** | UI-06 | New scan (after results) | Returns to homepage | Manual | |
| **UI** | UI-07 | Issue detail | WCAG, rule, selector, snippet | Manual | |
| **UI** | UI-08 | Severity filter | List filters by severity | Manual | |
| **Security** | SEC-01 | Invalid URL `not-a-url` | Clear error; no scan | Manual | |
| **Security** | SEC-02 | `http://127.0.0.1` | Private/local blocked | Manual | |
| **Security** | SEC-03 | `http://192.168.0.1` | Private/local blocked | Manual | |
| **Security** | SEC-04 | Many scans quickly | **429** rate-limit message | Manual | Dev default 120/min |
| **API** | API-01 | `GET /api/health` | JSON health payload | Optional | |
| **API** | API-02 | `POST /api/scans` | `201` + `scanId` | Optional | |
| **API** | API-03 | `GET /api/scans/:id` | → `completed` or `failed` | Optional | |
| **API** | API-04 | `GET /api/scans/:id/issues` | Issue array | Optional | |
| **API** | API-05 | Export JSON | Downloadable report | Optional | |
| **AI** | AI-01 | Health with key | `"ai": true` | If keyed | |
| **AI** | AI-02 | W3C bad demo scan | AI tips on issues | If keyed | Needs WEB-04 |
| **AI** | AI-03 | No API key | Scan completes without AI | If no key | |
| **Regression** | REG-01 | Port 4376, live scans, results not stuck | All OK after code changes | Manual | See §8 |

**Status key:** **Done (N)** = logged in results / verified · **Pending** = not run yet · **Manual** = checklist (mark Pass/Fail when you run it) · **Optional** / **If keyed** = run when relevant

---

## 1. Goals

Confirm that a tester can:

1. Start from the homepage  
2. Scan multiple public websites one after another  
3. See real results (score, severity counts, issues or clean success state)  
4. Export JSON and return via **New scan** / **Back to home**  
5. Hit expected errors for invalid/private URLs  

---

## 2. Environment setup

| Item | Expected |
|------|----------|
| Node.js | 20+ |
| Browser for app | Chrome/Edge/Firefox |
| Scanner browser | Google Chrome installed (Playwright channel) |
| Start command | `cd web && npm run dev` |
| Health check | `GET http://localhost:4376/api/health` → `ok: true` |
| Demo mode | **Off** (`USE_DEMO_SCAN` unset) for real results |
| AI tips | Optional (`AI_API_KEY` set or unset) |

---

## 3. Multi-site scan sequence (core test)

**Target:** **10 websites** minimum for MVP (**met**). **Extended target #27 complete**; **28** sites logged in [`TEST_RESULTS.md`](./TEST_RESULTS.md) (**8 Pass / 20 Fail** after resync 2026-07-28), including **#26–#27** (example.com, W3C bad demo) and **#28** W3Schools.

### Planned sites (test plan vs results log)

| Plan # | Site | URL | Purpose | Results log # | Website result |
|------:|------|-----|---------|-------------:|----------------|
| 1 | Google UK | https://www.google.co.uk/ | Large public site | 1 | Pass |
| 2 | YouTube | https://www.youtube.com/ | Complex JS app | 2 | Fail |
| 3 | BBC Weather Southall | https://www.bbc.co.uk/weather/2637490 | Local public page | 3 | Fail |
| 4 | Example | https://example.com/ | Simple clean page | 26 | Pass |
| 5 | W3C bad demo | https://www.w3.org/WAI/demos/bad/before/home.html | Known-bad page | 27 | Fail |
| 6+ | Tester choice | Various (see results log) | Extended coverage | 4–25 | Mixed |

Additional sites logged beyond the original plan table (iPlayer, News, Disney+, GitHub, ChatGPT, Spotify, Maps, Google workspace, Yahoo, Amazon, eBay, Netflix, ITVX, C4, C5, Lidl, Tesco, Iceland, Wikipedia) are listed in full in [`TEST_RESULTS.md`](./TEST_RESULTS.md).

Suggested sequence for **new** testers (or regression):

| # | Site | URL | Why include it |
|---|------|-----|----------------|
| 1 | Google UK | https://www.google.co.uk/ | Large public site; often few/no automated issues |
| 2 | YouTube | https://www.youtube.com/ | Complex JS app; tests render + rules |
| 3 | BBC Weather Southall | https://www.bbc.co.uk/weather/2637490 | Real local public-service page |
| 4 | Example | https://example.com/ | Simple clean page; expect strong/clean score |
| 5 | W3C bad demo | https://www.w3.org/WAI/demos/bad/before/home.html | Known-bad page; expect many issues / low score |
| 6+ | Tester choice | Any other public https sites | Only if extending past **#27** | Log in `TEST_RESULTS.md` |

### Pass criteria for each site
- [ ] Checklist progresses: Fetch → Render → Rules → AI → Score  
- [ ] Results screen appears (not stuck on checklist)  
- [ ] Score 0–100 shown with Strong / Fair / Needs work  
- [ ] Severity counts shown (critical / serious / moderate / minor)  
- [ ] If issues &gt; 0: list + detail open correctly  
- [ ] If issues = 0: “Looking good” success state shown  
- [ ] **Export JSON** downloads a report for that URL  
- [ ] **New scan** returns to homepage for the next URL  

### Notes for Google / YouTube
- A high score or `0` issues can still be a **valid** automated result  
- These sites change often and may show consent walls, bots challenges, or sparse axe findings  
- Record what you saw (score + issue count), not a fixed expected number  
- **Website Pass/Fail** (based on score/critical issues) is logged in [`TEST_RESULTS.md`](./TEST_RESULTS.md)

### Pass/Fail vs follow-up work (test plan)

When you run the multi-site sequence, record **two things** for each URL:

1. **Batch result** — **Pass** if score ≥ 85 and critical = 0; otherwise **Fail** (WEB-02).
2. **Follow-up** — If **total issues &gt; 0**, use the same workflow whether the site Passes or Fails:
   - Re-scan in Lumen → open issues → Rule help / export JSON.
   - **Fail:** fix **critical** first, then serious/moderate until Pass.
   - **Pass with issues:** no criticals today, but still triage moderates/minors so score stays ≥ 85.

| Bucket | What it means | Where to log / view |
|--------|----------------|---------------------|
| Pass, clean (0 issues) | Strong automated scan | [`TEST_RESULTS.md`](./TEST_RESULTS.md) + `/batch` — **Maintain Pass** |
| Pass, with issues | Meets Pass rule; optional fixes | Same — **Recommended actions** (pass guidance) |
| Fail | Score and/or critical gap | Same — **Recommended actions** (fail guidance) |

Live dashboard: [http://localhost:4376/batch](http://localhost:4376/batch) (snapshot; re-sync after full rescan).

---

## 4. UI flow tests

| ID | Test | Steps | Expected |
|----|------|-------|----------|
| UI-01 | Homepage load | Open http://localhost:4376 | Lumen brand, URL field, Check CTA, Try chips |
| UI-02 | Example chip | Click `example.com` chip | URL field fills correctly |
| UI-03 | W3C chip | Click `W3C bad demo` chip | URL field fills W3C bad demo URL |
| UI-04 | Checking screen | Start any scan | Progress bar + step checklist visible |
| UI-05 | Back while checking | On checking screen click **Back to home** | Returns to homepage |
| UI-06 | Results navigation | After results click **New scan** | Returns to homepage ready for next URL |
| UI-07 | Issue detail | On a page with issues, select an issue | Shows WCAG, rule, selector, snippet |
| UI-08 | Severity filter | Filter by Critical/Serious/etc. | List updates to that severity |

---

## 5. Validation & security tests

| ID | Test | Input | Expected |
|----|------|-------|----------|
| SEC-01 | Invalid URL | `not-a-url` | Clear error; no scan |
| SEC-02 | Localhost blocked | `http://127.0.0.1` | Error: private/local blocked |
| SEC-03 | Private host blocked | `http://192.168.0.1` | Error: private/local blocked |
| SEC-04 | Rate limit | Send many scans quickly from same IP | Eventually **429** / too many scans message |

---

## 6. API smoke tests (optional)

| ID | Test | Expected |
|----|------|----------|
| API-01 | `GET /api/health` | `ok: true`, includes `db`, `ai` |
| API-02 | `POST /api/scans` with Google URL | `201` + `scanId` |
| API-03 | Poll `GET /api/scans/:id` | Moves to `completed` or `failed` |
| API-04 | `GET /api/scans/:id/issues` after complete | Issue array (may be empty) |
| API-05 | `GET /api/scans/:id/export?format=json` | Downloadable JSON report |

---

## 7. AI enrichment tests (if key configured)

| ID | Test | Expected |
|----|------|----------|
| AI-01 | Health shows AI | `/api/health` → `"ai": true` |
| AI-02 | Tips on dirty page | Scan W3C bad demo; top issues show AI guidance/fix |
| AI-03 | No key still works | Without key, scan still completes with rule results only |

---

## 8. Regression checklist after changes

- [ ] Port **4376** still used by `npm run dev`  
- [ ] Live scans work (not stuck in demo mode)  
- [ ] Results appear after checklist completes  
- [ ] Multi-site sequence (Google → YouTube → other) still works  
- [ ] Back to home / New scan labels behave as designed  

---

## 9. Bug report template

When something fails, capture:

1. URL scanned  
2. Time + whether demo mode / AI key was on  
3. Last checklist step visible  
4. Score / counts if Results appeared  
5. Screenshot + exported JSON (if any)  
6. `/api/health` JSON  

---

## 10. Sign-off

| Role | Name | Date | Result |
|------|------|------|--------|
| Tester | Manual MVP run | 2026-07-27 | **Pass** (tool) |
| Website batch | **28** sites logged | 2026-07-28 | [`TEST_RESULTS.md`](./TEST_RESULTS.md) — **8 Pass / 20 Fail** (live resync) |
| Notes | Extended batch **#1–#27** complete; **#28** W3Schools (score 0). Website scores showcase automated Pass/Fail only. | | |

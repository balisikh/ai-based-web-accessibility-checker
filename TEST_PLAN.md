# Test Plan — Lumen Accessibility Checker

**Product:** AI-Based Web Accessibility Checker (Lumen)  
**App URL (local):** http://localhost:4376  
**Scope:** Manual MVP verification (UI + live scans + API basics)  
**Date:** July 2026

> Automated axe findings are assistive only — not a legal WCAG certificate.

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

**Target:** **10 websites** (enough coverage for this MVP test plan).

Run these **in order**, using **New scan** between each:

| # | Site | URL | Why include it |
|---|------|-----|----------------|
| 1 | Google UK | https://www.google.co.uk/ | Large public site; often few/no automated issues |
| 2 | YouTube | https://www.youtube.com/ | Complex JS app; tests render + rules |
| 3 | BBC Weather Southall | https://www.bbc.co.uk/weather/2637490 | Real local public-service page |
| 4 | Example | https://example.com/ | Simple clean page; expect strong/clean score |
| 5 | W3C bad demo | https://www.w3.org/WAI/demos/bad/before/home.html | Known-bad page; expect many issues / low score |
| 6–10 | Tester choice | Any other public https sites | Fill remaining slots to reach **10 total** |

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
| Tester | | | Pass / Fail |
| Notes | | | |

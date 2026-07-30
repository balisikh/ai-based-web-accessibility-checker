# Accessibility Scan Results Log

**Product:** Lumen Accessibility Checker  
**Purpose:** Record whether each **website** passed or failed based on automated accessibility findings (not whether the Lumen tool itself worked).  
**App:** http://localhost:4376  
**Batch status:** **28** websites logged — extended target **27** complete; **#28** W3Schools (post-batch).  
**Snapshot resync:** Full live batch re-scan **2026-07-30** (`web/batch-rescan-report.json`) — table below matches `/batch`. **27/28** scans OK; **#16 Amazon UK** rescan failed (axe error) — prior row kept.

---

## Pass / Fail rule (website)

| Result | Rule |
|--------|------|
| **Pass** | Score **≥ 85** (Strong) **and** Critical issues **= 0** |
| **Fail** | Score **&lt; 85** **or** Critical issues **≥ 1** |

Notes:
- This is an **automated axe** outcome only — not a legal WCAG certificate.
- Large sites can change day to day; re-scan if needed.
- Tool health (checklist/export working) is tracked separately in `TEST_PLAN.md`.
- Scans are **unauthenticated** unless noted; Google Mail/Docs often hit sign-in or product shells, not logged-in apps.

---

## Summary count

| Metric | Count |
|--------|------:|
| Websites tested | **28** |
| **Target (extended)** | **27** (complete) |
| **Passed** | **8** (29%) |
| **Passed (0 issues)** | **4** |
| **Passed (with issues)** | **4** — still Pass; triage in table below |
| **Failed** | **20** (71%) |
| Initial MVP target | 10 (met on 2026-07-27) |

### Severity totals (all 28 scans)

| Critical | Serious | Moderate | Minor | Total issues |
|---------:|--------:|---------:|------:|-------------:|
| 144 | 37 | 188 | 5 | 374 |

### Quick list

| Result | Websites |
|--------|----------|
| **Pass** | Google UK, BBC iPlayer, BBC News, Disney+ UK, GitHub (balisikh), Google Maps, Wikipedia, example.com |
| **Fail** | YouTube, BBC Weather Southall, ChatGPT, **Spotify**, Gmail, Google Docs, Google Sheets, Google Slides, Yahoo, Amazon UK, eBay UK, Netflix UK, ITVX, Channel 4, Channel 5, Lidl UK, Tesco, Iceland, W3C bad demo, W3Schools |

### Failed sites — notes and recommended actions

These are **tester recommendations** (not fixes applied by this project). Rule-level detail comes from re-scanning the URL in Lumen. The same text appears on the [batch results page](http://localhost:4376/batch) (**Notes & recommended actions** column) and in `web/src/lib/website-batch-fail-guidance.ts`.

| # | Site | Note | Recommended actions (summary) |
|--:|------|------|--------------------------------|
| 2 | YouTube | | Fix invalid ARIA on nav (`aria-allowed-attr`); re-scan until critical = 0 and score ≥ 85. |
| 3 | BBC Weather | Score dropped on re-scan (6 serious) | Fix critical `aria-required-attr`, then `aria-hidden-focus` and `color-contrast`; re-scan after page updates. |
| 8 | ChatGPT | | Fix `aria-allowed-attr` and `color-contrast`; export JSON before/after. |
| 9 | Spotify | App/login shell on re-scan | Confirm URL/cookies; triage critical ARIA; re-scan vs prior Pass. |
| 11 | Gmail | Sign-in surface | Fix `select-name` on sign-in; optional logged-in scan separately. |
| 12 | Google Docs | | Align scan target (sign-in vs editor); fix `select-name`; re-scan one consistent URL. |
| 13 | Google Sheets | | Fix `aria-required-parent` and `list` markup; prioritize criticals. |
| 14 | Google Slides | | Fix `aria-required-parent` and `list`; re-scan and export for devs. |
| 15 | Yahoo | | Add `html` lang; fix `meta-viewport`; re-scan (score 78 → need ≥ 85). |
| 16 | Amazon UK | Rescan failed 2026-07-30 — prior row kept | Re-scan when page loads cleanly; fix serious/moderate; log one consistent row. |
| 17 | eBay UK | | Fix `aria-hidden-focus` and landmark/heading/role issues; re-scan. |
| 18 | Netflix UK | | Fix regions, landmarks, heading order, viewport; re-scan (moderate-heavy). |
| 19 | ITVX | | Fix `region`, `meta-viewport`, `landmark-one-main`; re-scan (79 → ≥ 85). |
| 20 | Channel 4 | Score 46 on re-scan (2 serious) | Re-scan; fix serious then moderate issues via Rule help. |
| 21 | Channel 5 | | Fix moderate landmark/region/viewport issues; re-scan. |
| 22 | Lidl UK | | Fix 1 serious + 1 moderate; re-scan (78 → ≥ 85). |
| 23 | Tesco | | Fix 1 serious + 4 moderate; re-scan. |
| 24 | Iceland | | Same pattern as Tesco; re-scan from score 57. |
| 27 | W3C bad demo | Known-bad demo | Regression/learning only — not production remediation. |
| 28 | W3Schools | | Triage serious then moderates; re-scan; use AI tips if enabled. |

### Passed sites — notes and recommended actions

Shown on `/batch` — **Maintain Pass** when 0 issues; **Recommended actions** when Pass but issues remain (`web/src/lib/website-batch-pass-guidance.ts`).

| # | Site | Note (summary) | Recommendations (summary) |
|--:|------|----------------|---------------------------|
| 1 | Google UK | Perfect score | Baseline benchmark; re-scan after UI changes |
| 4 | BBC iPlayer | 2 moderate | Fix moderates; keep critical at 0 |
| 5 | BBC News | 1 moderate | Triage moderate; monitor BBC updates |
| 6 | Disney+ UK | Clean scan | Periodic re-scan |
| 7 | GitHub | Profile page scope | Re-scan profile; scan other URLs separately |
| 10 | Google Maps | Clean scan | Re-scan after Maps shell updates |
| 25 | Wikipedia | 3 minor | Optional polish; watch main-page changes |
| 26 | example.com | Regression URL | CI/batch checks; pair with W3C bad demo |

---

## Results table

| # | Website | URL | Score | Critical | Serious | Moderate | Minor | Total issues | Website result | Date | Notes |
|--:|---------|-----|------:|---------:|--------:|---------:|------:|-------------:|----------------|------|-------|
| 1 | Google UK | https://www.google.co.uk/ | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-30 | |
| 2 | YouTube | https://www.youtube.com/ | 0 | 4 | 0 | 0 | 0 | 4 | **Fail** | 2026-07-30 | |
| 3 | BBC Weather Southall | https://www.bbc.co.uk/weather/2637490 | 0 | 1 | 6 | 3 | 0 | 10 | **Fail** | 2026-07-30 | |
| 4 | BBC iPlayer | https://www.bbc.co.uk/iplayer | 86 | 0 | 0 | 2 | 0 | 2 | **Pass** | 2026-07-30 | |
| 5 | BBC News | https://www.bbc.co.uk/news | 93 | 0 | 0 | 1 | 0 | 1 | **Pass** | 2026-07-30 | |
| 6 | Disney+ UK | https://www.disneyplus.com/en-gb | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-30 | |
| 7 | GitHub balisikh | https://github.com/balisikh | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-30 | Profile page |
| 8 | ChatGPT | https://chatgpt.com | 50 | 1 | 1 | 1 | 1 | 4 | **Fail** | 2026-07-30 | |
| 9 | Spotify Web Player | https://open.spotify.com/ | 0 | 100 | 0 | 0 | 0 | 100 | **Fail** | 2026-07-30 | Re-scan: confirm app shell in UI |
| 10 | Google Maps | https://www.google.com/maps | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-30 | |
| 11 | Google Mail (Gmail) | https://mail.google.com | 33 | 1 | 0 | 6 | 0 | 7 | **Fail** | 2026-07-30 | Sign-in surface |
| 12 | Google Docs | https://docs.google.com | 33 | 1 | 0 | 6 | 0 | 7 | **Fail** | 2026-07-30 | Sign-in shell (resync) |
| 13 | Google Sheets | https://sheets.google.com | 33 | 1 | 0 | 6 | 0 | 7 | **Fail** | 2026-07-30 | Sign-in shell (resync) |
| 14 | Google Slides | https://slides.google.com | 33 | 1 | 0 | 6 | 0 | 7 | **Fail** | 2026-07-30 | Sign-in shell (resync) |
| 15 | Yahoo | https://www.yahoo.com | 78 | 0 | 1 | 1 | 0 | 2 | **Fail** | 2026-07-30 | Fail on score &lt; 85 only |
| 16 | Amazon UK | https://www.amazon.co.uk | 71 | 0 | 1 | 2 | 0 | 3 | **Fail** | 2026-07-30 | Rescan failed — kept prior snapshot |
| 17 | eBay UK | https://www.ebay.co.uk | 0 | 0 | 8 | 0 | 0 | 8 | **Fail** | 2026-07-30 | |
| 18 | Netflix UK | https://www.netflix.com/gb/ | 0 | 0 | 0 | 16 | 0 | 16 | **Fail** | 2026-07-30 | |
| 19 | ITVX | https://www.itv.com/watch | 79 | 0 | 0 | 3 | 0 | 3 | **Fail** | 2026-07-30 | |
| 20 | Channel 4 | https://www.channel4.com/ | 46 | 0 | 2 | 3 | 1 | 6 | **Fail** | 2026-07-30 | |
| 21 | Channel 5 | https://www.channel5.com/ | 79 | 0 | 0 | 3 | 0 | 3 | **Fail** | 2026-07-30 | |
| 22 | Lidl UK | https://www.lidl.co.uk/ | 78 | 0 | 1 | 1 | 0 | 2 | **Fail** | 2026-07-30 | |
| 23 | Tesco | https://www.tesco.com/ | 57 | 0 | 1 | 4 | 0 | 5 | **Fail** | 2026-07-30 | |
| 24 | Iceland | https://www.iceland.co.uk/ | 57 | 0 | 1 | 4 | 0 | 5 | **Fail** | 2026-07-30 | |
| 25 | Wikipedia (en Main Page) | https://en.wikipedia.org/wiki/Main_Page | 91 | 0 | 0 | 0 | 3 | 3 | **Pass** | 2026-07-30 | |
| 26 | example.com | https://example.com/ | 86 | 0 | 0 | 2 | 0 | 2 | **Pass** | 2026-07-30 | |
| 27 | W3C bad demo | https://www.w3.org/WAI/demos/bad/before/home.html | 0 | 34 | 10 | 23 | 0 | 67 | **Fail** | 2026-07-30 | Known-bad demo |
| 28 | W3Schools | https://www.w3schools.com/ | 0 | 0 | 5 | 95 | 0 | 100 | **Fail** | 2026-07-30 | |

**Verification:** Full batch re-sync **2026-07-30** via `web/scripts/batch-rescan.ts` (~117s). Apply with `web/scripts/apply-batch-rescan.ts`. Narratives below match the **Results table** and `/batch`.

---

## Why recorded sites passed or failed

Synced to rescan **2026-07-30**. Pass = score ≥ 85 and critical = 0.

### Google UK — Pass
- Score 100, 0 issues. Met Pass rule.

### YouTube — Fail
- Score 0, 4 critical (`aria-allowed-attr` on nav). Fail: critical ≥ 1 and score &lt; 85.

### BBC Weather Southall — Fail
- Score 0, 1 critical, 6 serious, 3 moderate, 10 issues. Fail: critical ≥ 1 and score &lt; 85.

### BBC iPlayer — Pass
- Score 86, 0 critical, 2 moderate. Met Pass rule.

### BBC News — Pass
- Score 93, 0 critical, 1 moderate. Met Pass rule.

### Disney+ UK — Pass
- Score 100, 0 issues. Met Pass rule.

### GitHub balisikh — Pass
- Score 100, 0 issues (profile page). Met Pass rule.

### ChatGPT — Fail
- Score 50, 1 critical, 1 serious, 1 moderate, 1 minor. Fail: critical ≥ 1 and score &lt; 85.

### Spotify Web Player — Fail
- Score 0, 100 critical (100 issues). Re-scan hit app/login shell — confirm in UI before treating as final. Fail: critical ≥ 1.

### Google Maps — Pass
- Score 100, 0 issues. Met Pass rule.

### Google Mail (Gmail) — Fail
- Score 33, 1 critical, 6 moderate (sign-in surface). Fail: critical ≥ 1 and score &lt; 85.

### Google Docs — Fail
- Score 33, 1 critical, 6 moderate (sign-in shell). Fail: critical ≥ 1 and score &lt; 85.

### Google Sheets — Fail
- Score 33, 1 critical, 6 moderate. Fail: critical ≥ 1 and score &lt; 85.

### Google Slides — Fail
- Score 33, 1 critical, 6 moderate. Fail: critical ≥ 1 and score &lt; 85.

### Yahoo — Fail
- Score 78, 0 critical, 1 serious, 1 moderate. Fail: score &lt; 85 only.

### Amazon UK — Fail
- Score 71, 0 critical, 1 serious, 2 moderate. Fail: score &lt; 85. Rescan **2026-07-30** failed (axe error) — row kept from prior snapshot.

### eBay UK — Fail
- Score 0, 8 serious. Fail: score &lt; 85 (serious penalties).

### Netflix UK — Fail
- Score 0, 16 moderate. Fail: score &lt; 85.

### ITVX — Fail
- Score 79, 3 moderate. Fail: score &lt; 85.

### Channel 4 — Fail
- Score 46, 2 serious, 3 moderate, 1 minor, 6 issues. Fail: score &lt; 85.

### Channel 5 — Fail
- Score 79, 3 moderate. Fail: score &lt; 85.

### Lidl UK — Fail
- Score 78, 1 serious, 1 moderate. Fail: score &lt; 85.

### Tesco — Fail
- Score 57, 1 serious, 4 moderate. Fail: score &lt; 85.

### Iceland — Fail
- Score 57, 1 serious, 4 moderate. Fail: score &lt; 85.

### Wikipedia (en Main Page) — Pass
- Score 91, 0 critical, 3 minor. Met Pass rule.

### example.com — Pass
- Score 86, 0 critical, 2 moderate. Met Pass rule (#26).

### W3C bad demo — Fail
- Score 0, 34 critical, 10 serious, 23 moderate (67 issues). Known-bad demo (#27).

### W3Schools — Fail
- Score 0, 5 serious, 95 moderate (100 issues). Fail: score &lt; 85 (#28).

---

## Batch status

**28** sites logged (**8 Pass / 20 Fail**). Extended target **27** complete; **#28** W3Schools added post-batch. Optional extras: append rows in `website-batch-results.ts`, re-run `validate:batch`, and update this file.

Regression URLs: **example.com** (#26 Pass) and **W3C bad demo** (#27 Fail) are included in the batch, not out of scope.


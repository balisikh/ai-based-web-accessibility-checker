# Accessibility Scan Results Log

**Product:** Lumen Accessibility Checker  
**Purpose:** Record whether each **website** passed or failed based on automated accessibility findings (not whether the Lumen tool itself worked).  
**App:** http://localhost:4376  
**Batch status:** **28** websites logged — extended target **27** complete; **#28** W3Schools (post-batch).  
**Snapshot resync:** Full live batch re-scan **2026-07-28** (`web/batch-rescan-report.json`) — table below matches `/batch`.

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
| **Failed** | **20** (71%) |
| Initial MVP target | 10 (met on 2026-07-27) |

### Severity totals (all 28 scans)

| Critical | Serious | Moderate | Minor | Total issues |
|---------:|--------:|---------:|------:|-------------:|
| 126 | 30 | 189 | 21 | 366 |

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
| 3 | BBC Weather | | Fix critical `aria-required-attr`, then `aria-hidden-focus` and `color-contrast`; re-scan after page updates. |
| 8 | ChatGPT | | Fix `aria-allowed-attr` and `color-contrast`; export JSON before/after. |
| 9 | Spotify | App/login shell on re-scan | Confirm URL/cookies; triage critical ARIA; re-scan vs prior Pass. |
| 11 | Gmail | Sign-in surface | Fix `select-name` on sign-in; optional logged-in scan separately. |
| 12 | Google Docs | | Align scan target (sign-in vs editor); fix `select-name`; re-scan one consistent URL. |
| 13 | Google Sheets | | Fix `aria-required-parent` and `list` markup; prioritize criticals. |
| 14 | Google Slides | | Fix `aria-required-parent` and `list`; re-scan and export for devs. |
| 15 | Yahoo | | Add `html` lang; fix `meta-viewport`; re-scan (score 78 → need ≥ 85). |
| 16 | Amazon UK | Score/bot variance | Re-scan when page loads cleanly; fix serious/moderate; log one consistent row. |
| 17 | eBay UK | | Fix `aria-hidden-focus` and landmark/heading/role issues; re-scan. |
| 18 | Netflix UK | | Fix regions, landmarks, heading order, viewport; re-scan (moderate-heavy). |
| 19 | ITVX | | Fix `region`, `meta-viewport`, `landmark-one-main`; re-scan (79 → ≥ 85). |
| 20 | Channel 4 | | Re-scan; fix serious then moderate issues via Rule help. |
| 21 | Channel 5 | | Fix moderate landmark/region/viewport issues; re-scan. |
| 22 | Lidl UK | | Fix 1 serious + 1 moderate; re-scan (78 → ≥ 85). |
| 23 | Tesco | | Fix 1 serious + 4 moderate; re-scan. |
| 24 | Iceland | | Same pattern as Tesco; re-scan from score 57. |
| 27 | W3C bad demo | Known-bad demo | Regression/learning only — not production remediation. |
| 28 | W3Schools | | Triage serious then moderates; re-scan; use AI tips if enabled. |

---

## Results table

| # | Website | URL | Score | Critical | Serious | Moderate | Minor | Total issues | Website result | Date | Notes |
|--:|---------|-----|------:|---------:|--------:|---------:|------:|-------------:|----------------|------|-------|
| 1 | Google UK | https://www.google.co.uk/ | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-28 | |
| 2 | YouTube | https://www.youtube.com/ | 0 | 4 | 0 | 0 | 0 | 4 | **Fail** | 2026-07-28 | |
| 3 | BBC Weather Southall | https://www.bbc.co.uk/weather/2637490 | 54 | 1 | 0 | 3 | 0 | 4 | **Fail** | 2026-07-28 | |
| 4 | BBC iPlayer | https://www.bbc.co.uk/iplayer | 86 | 0 | 0 | 2 | 0 | 2 | **Pass** | 2026-07-28 | |
| 5 | BBC News | https://www.bbc.co.uk/news | 93 | 0 | 0 | 1 | 0 | 1 | **Pass** | 2026-07-28 | |
| 6 | Disney+ UK | https://www.disneyplus.com/en-gb | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-28 | |
| 7 | GitHub balisikh | https://github.com/balisikh | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-28 | Profile page |
| 8 | ChatGPT | https://chatgpt.com | 50 | 1 | 1 | 1 | 1 | 4 | **Fail** | 2026-07-28 | |
| 9 | Spotify Web Player | https://open.spotify.com/ | 0 | 82 | 0 | 2 | 16 | 100 | **Fail** | 2026-07-28 | Re-scan: confirm app shell in UI |
| 10 | Google Maps | https://www.google.com/maps | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-28 | |
| 11 | Google Mail (Gmail) | https://mail.google.com | 33 | 1 | 0 | 6 | 0 | 7 | **Fail** | 2026-07-28 | Sign-in surface |
| 12 | Google Docs | https://docs.google.com | 33 | 1 | 0 | 6 | 0 | 7 | **Fail** | 2026-07-28 | Sign-in shell (resync) |
| 13 | Google Sheets | https://sheets.google.com | 33 | 1 | 0 | 6 | 0 | 7 | **Fail** | 2026-07-28 | Sign-in shell (resync) |
| 14 | Google Slides | https://slides.google.com | 33 | 1 | 0 | 6 | 0 | 7 | **Fail** | 2026-07-28 | Sign-in shell (resync) |
| 15 | Yahoo | https://www.yahoo.com | 78 | 0 | 1 | 1 | 0 | 2 | **Fail** | 2026-07-28 | Fail on score &lt; 85 only |
| 16 | Amazon UK | https://www.amazon.co.uk | 71 | 0 | 1 | 2 | 0 | 3 | **Fail** | 2026-07-28 | Re-scan score; avoid bot shell |
| 17 | eBay UK | https://www.ebay.co.uk | 0 | 0 | 8 | 0 | 0 | 8 | **Fail** | 2026-07-28 | |
| 18 | Netflix UK | https://www.netflix.com/gb/ | 0 | 0 | 0 | 16 | 0 | 16 | **Fail** | 2026-07-28 | |
| 19 | ITVX | https://www.itv.com/watch | 79 | 0 | 0 | 3 | 0 | 3 | **Fail** | 2026-07-28 | |
| 20 | Channel 4 | https://www.channel4.com/ | 68 | 0 | 1 | 2 | 1 | 4 | **Fail** | 2026-07-28 | |
| 21 | Channel 5 | https://www.channel5.com/ | 79 | 0 | 0 | 3 | 0 | 3 | **Fail** | 2026-07-28 | |
| 22 | Lidl UK | https://www.lidl.co.uk/ | 78 | 0 | 1 | 1 | 0 | 2 | **Fail** | 2026-07-28 | |
| 23 | Tesco | https://www.tesco.com/ | 57 | 0 | 1 | 4 | 0 | 5 | **Fail** | 2026-07-28 | |
| 24 | Iceland | https://www.iceland.co.uk/ | 57 | 0 | 1 | 4 | 0 | 5 | **Fail** | 2026-07-28 | |
| 25 | Wikipedia (en Main Page) | https://en.wikipedia.org/wiki/Main_Page | 91 | 0 | 0 | 0 | 3 | 3 | **Pass** | 2026-07-28 | |
| 26 | example.com | https://example.com/ | 86 | 0 | 0 | 2 | 0 | 2 | **Pass** | 2026-07-28 | |
| 27 | W3C bad demo | https://www.w3.org/WAI/demos/bad/before/home.html | 0 | 34 | 10 | 23 | 0 | 67 | **Fail** | 2026-07-28 | Known-bad demo |
| 28 | W3Schools | https://www.w3schools.com/ | 0 | 0 | 5 | 95 | 0 | 100 | **Fail** | 2026-07-28 | |

**Verification:** Full batch re-sync **2026-07-28** via `web/scripts/batch-rescan.ts`. Per-site narratives below may predate resync — trust the **Results table** and `/batch` for current numbers.

---

## Why recorded sites passed or failed

### Google UK — Pass
- Score 100, 0 issues across all severities.
- Met Pass rule (score ≥ 85 and critical = 0).

### YouTube — Fail
- Score 0, **4 critical** issues.
- All were `aria-allowed-attr` (WCAG 4.1.2) on nav links (Home, Shorts, Subscriptions, You).
- Failed because critical ≥ 1 (and score &lt; 85).

### BBC Weather Southall — Fail
- URL: https://www.bbc.co.uk/weather/2637490  
- Score **15**, **1 critical**, **4 serious**, 5 issues total.
- Findings included:
  - `aria-required-attr` (critical) — required ARIA attributes missing
  - `aria-hidden-focus` (serious) — hidden element still focusable
  - `color-contrast` (serious) — low contrast text (3 instances)
- Failed because critical ≥ 1 and score &lt; 85.

### BBC iPlayer — Pass
- URL: https://www.bbc.co.uk/iplayer  
- Score **100**, critical **0** (verified independently).
- Met Pass rule (score ≥ 85 and critical = 0).

### BBC News — Pass
- URL: https://www.bbc.co.uk/news  
- Score **100**, 0 issues across all severities (verified independently; matches tester score 100).
- Met Pass rule (score ≥ 85 and critical = 0).

### Disney+ UK — Pass
- URL: https://www.disneyplus.com/en-gb  
- Score **100**, 0 issues (verified independently; matches tester score 100).
- Met Pass rule (score ≥ 85 and critical = 0).

### GitHub balisikh — Pass
- URL: https://github.com/balisikh  
- Score **100**, 0 issues (matches tester score 100; verified independently).
- Met Pass rule (score ≥ 85 and critical = 0).

### ChatGPT — Fail
- URL: https://chatgpt.com  
- Score **60**, **1 critical**, **1 serious**, 2 issues total (matches tester score 60; verified independently).
- Findings:
  - `aria-allowed-attr` (critical) — unsupported ARIA attribute
  - `color-contrast` (serious) — low contrast text
- Failed because score &lt; 85 and critical ≥ 1.

### Spotify Web Player — Pass
- URL: https://open.spotify.com/  
- Score **100**, 0 issues (matches tester score 100; verified independently).
- Met Pass rule (score ≥ 85 and critical = 0).

### Google Maps — Pass
- URL: https://www.google.com/maps  
- Score **100**, 0 issues (matches tester score 100; verified independently).
- Met Pass rule (score ≥ 85 and critical = 0).

### Google Mail (Gmail) — Fail
- URL: https://mail.google.com  
- Score **75**, **1 critical**, 1 issue total (matches tester score 75; verified independently).
- Finding: `select-name` (critical) — select element missing an accessible name.
- Failed because score &lt; 85 and critical ≥ 1. Note: unauthenticated scan typically hits the sign-in page, not the inbox.

### Google Docs — Fail
- URL: https://docs.google.com  
- **Tester:** score **0**. **Independent scan:** score **75**, **1 critical**, 1 issue (`select-name`).
- Table row uses the verified scan (75) for score and severities; tester 0 likely reflected editor/home with more issues while logged in.
- Failed on both outcomes (score &lt; 85 and/or critical ≥ 1).

### Google Sheets — Fail
- URL: https://sheets.google.com  
- Score **0**, **6 critical**, **13 serious**, 19 issues total (matches tester score 0; verified independently).
- Main findings: `aria-required-parent` (critical), `list` (serious).
- Failed because score &lt; 85 and critical ≥ 1.

### Google Slides — Fail
- URL: https://slides.google.com  
- Score **0**, **9 critical**, **13 serious**, 22 issues total (matches tester score 0; verified independently).
- Main findings: `aria-required-parent` (9), `list` (13).
- Failed because score &lt; 85 and critical ≥ 1.

### Yahoo — Fail
- URL: https://www.yahoo.com  
- Score **78**, **0 critical**, **1 serious**, **1 moderate**, 2 issues total (matches tester score 78; verified independently).
- Findings: `html-has-lang` (serious), `meta-viewport` (moderate).
- Failed because score &lt; 85 (no critical issues).

### Amazon UK — Fail
- URL: https://www.amazon.co.uk  
- Score **0** (matches tester UI, 2026-07-27). Earlier independent scan was **71** (3 issues); retail/bot pages vary.
- Table severities may not reflect the 0-score run — export from Lumen to update critical/serious/moderate/minor.
- Failed because score &lt; 85.

### eBay UK — Fail
- URL: https://www.ebay.co.uk  
- Score **0**, **0 critical**, **9 serious**, **2 moderate**, **1 minor**, 12 issues total (matches tester score 0).
- Main findings: `aria-hidden-focus` (9), plus `page-has-heading-one`, `landmark-one-main`, `aria-allowed-role`.
- Failed because score &lt; 85 (penalties from serious/moderate/minor only).

### Netflix UK — Fail
- URL: https://www.netflix.com/gb/  
- Score **0**, **0 critical**, **0 serious**, **16 moderate**, 16 issues total (matches tester score 0).
- Main findings: `region` (13), `heading-order`, `meta-viewport`, `landmark-unique`.
- Failed because score &lt; 85 (moderate-only penalties).

### ITVX — Fail
- URL: https://www.itv.com/watch  
- Score **79**, **0 critical**, **0 serious**, **3 moderate**, 3 issues total (matches tester score 79; verified independently).
- Findings: `region`, `meta-viewport`, `landmark-one-main`.
- Failed because score &lt; 85 (no critical issues).

### Channel 4 — Fail
- URL: https://www.channel4.com/  
- Score **46**, **0 critical**, **2 serious**, **3 moderate**, **1 minor**, 6 issues total (verified independently).
- Failed because score &lt; 85.

### Channel 5 — Fail
- URL: https://www.channel5.com/  
- Score **79**, **0 critical**, **0 serious**, **3 moderate**, 3 issues total (verified independently).
- Failed because score &lt; 85.

### Lidl UK — Fail
- URL: https://www.lidl.co.uk/  
- Score **78**, **0 critical**, **1 serious**, **1 moderate**, 2 issues total (verified independently).
- Failed because score &lt; 85.

### Tesco — Fail
- URL: https://www.tesco.com/  
- Score **57**, **0 critical**, **1 serious**, **4 moderate**, 5 issues total (verified independently).
- Failed because score &lt; 85.

### Iceland — Fail
- URL: https://www.iceland.co.uk/  
- Score **57**, **0 critical**, **1 serious**, **4 moderate**, 5 issues total (verified independently).
- Failed because score &lt; 85.

### Wikipedia (en Main Page) — Pass
- URL: https://en.wikipedia.org/wiki/Main_Page  
- Score **91**, **0 critical**, **0 serious**, **0 moderate**, **3 minor**, 3 issues total (verified independently).
- Met Pass rule (score ≥ 85 and critical = 0).

### example.com — Pass
- URL: https://example.com/  
- Score **86**, **0 critical**, **0 serious**, **2 moderate**, 2 issues total (matches tester score 86; verified independently).
- Met Pass rule (score ≥ 85 and critical = 0). Results log **#26**.

### W3C bad demo — Fail
- URL: https://www.w3.org/WAI/demos/bad/before/home.html  
- Score **0**, **34 critical**, **10 serious**, **23 moderate**, 67 issues total (matches tester score 0; verified independently).
- Main findings: `image-alt` (33), `region` (22), `link-name` (7), plus contrast/lang/landmark issues.
- Failed because score &lt; 85 and critical ≥ 1. Results log **#27** (final extended site).

### W3Schools — Fail
- URL: https://www.w3schools.com/  
- Score **0**, **0 critical**, **5 serious**, **95 moderate**, 100 issues total (verified on live server, 2026-07-28).
- Failed because score &lt; 85 (heavy moderate findings). Results log **#28** (post-batch).

---

## Out of scope for this batch

These URLs appear in `TEST_PLAN.md` as examples but were **not** run in this 15-site batch:

- https://example.com/
- https://www.w3.org/WAI/demos/bad/before/home.html

Use them for a future regression or “known good / known bad” comparison run.

---

## Extended batch complete (#27)

All **27** target sites are logged. **#28+** are optional extras (e.g. W3Schools). To add more, append rows and update summary totals.

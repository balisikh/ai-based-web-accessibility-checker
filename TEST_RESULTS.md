# Accessibility Scan Results Log

**Product:** Lumen Accessibility Checker  
**Purpose:** Record whether each **website** passed or failed based on automated accessibility findings (not whether the Lumen tool itself worked).  
**App:** http://localhost:4376  
**Batch status:** **25 websites** logged — **session paused** (continue **#26+** tomorrow). Initial MVP batch (10) completed earlier; extensions **#11–25** on 2026-07-27.

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
| Websites tested | **25** |
| **Passed** | **8** (32%) |
| **Failed** | **17** (68%) |
| Initial MVP target | 10 (met on 2026-07-27) |
| Extended run (today) | **#11–25** (15 sites); **#26+** next session |

### Severity totals (all 25 scans)

| Critical | Serious | Moderate | Minor | Total issues |
|---------:|--------:|---------:|------:|-------------:|
| 23 | 47 | 39 | 5 | 114 |

### Quick list

| Result | Websites |
|--------|----------|
| **Pass** | Google UK, BBC iPlayer, BBC News, Disney+ UK, GitHub (balisikh), Spotify, Google Maps, Wikipedia |
| **Fail** | YouTube, BBC Weather Southall, ChatGPT, Gmail, Google Docs, Google Sheets, Google Slides, Yahoo, Amazon UK, eBay UK, Netflix UK, ITVX, Channel 4, Channel 5, Lidl UK, Tesco, Iceland |

---

## Results table

| # | Website | URL | Score | Critical | Serious | Moderate | Minor | Total issues | Website result | Date | Notes |
|--:|---------|-----|------:|---------:|--------:|---------:|------:|-------------:|----------------|------|-------|
| 1 | Google UK | https://www.google.co.uk/ | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 2 | YouTube | https://www.youtube.com/ | 0 | 4 | 0 | 0 | 0 | 4 | **Fail** | 2026-07-27 | |
| 3 | BBC Weather Southall | https://www.bbc.co.uk/weather/2637490 | 15 | 1 | 4 | 0 | 0 | 5 | **Fail** | 2026-07-27 | |
| 4 | BBC iPlayer | https://www.bbc.co.uk/iplayer | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 5 | BBC News | https://www.bbc.co.uk/news | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 6 | Disney+ UK | https://www.disneyplus.com/en-gb | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 7 | GitHub balisikh | https://github.com/balisikh | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | Profile page |
| 8 | ChatGPT | https://chatgpt.com | 60 | 1 | 1 | 0 | 0 | 2 | **Fail** | 2026-07-27 | |
| 9 | Spotify Web Player | https://open.spotify.com/ | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 10 | Google Maps | https://www.google.com/maps | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 11 | Google Mail (Gmail) | https://mail.google.com | 75 | 1 | 0 | 0 | 0 | 1 | **Fail** | 2026-07-27 | Sign-in surface |
| 12 | Google Docs | https://docs.google.com | 75 | 1 | 0 | 0 | 0 | 1 | **Fail** | 2026-07-27 | Tester 0 vs verify 75 — see notes |
| 13 | Google Sheets | https://sheets.google.com | 0 | 6 | 13 | 0 | 0 | 19 | **Fail** | 2026-07-27 | |
| 14 | Google Slides | https://slides.google.com | 0 | 9 | 13 | 0 | 0 | 22 | **Fail** | 2026-07-27 | |
| 15 | Yahoo | https://www.yahoo.com | 78 | 0 | 1 | 1 | 0 | 2 | **Fail** | 2026-07-27 | Fail on score &lt; 85 only |
| 16 | Amazon UK | https://www.amazon.co.uk | 0 | 0 | 1 | 2 | 0 | 3 | **Fail** | 2026-07-27 | Score per tester UI (0); severities from prior verify — refresh from Lumen if counts differ |
| 17 | eBay UK | https://www.ebay.co.uk | 0 | 0 | 9 | 2 | 1 | 12 | **Fail** | 2026-07-27 | Matches tester score 0 |
| 18 | Netflix UK | https://www.netflix.com/gb/ | 0 | 0 | 0 | 16 | 0 | 16 | **Fail** | 2026-07-27 | Matches tester score 0 |
| 19 | ITVX | https://www.itv.com/watch | 79 | 0 | 0 | 3 | 0 | 3 | **Fail** | 2026-07-27 | |
| 20 | Channel 4 | https://www.channel4.com/ | 46 | 0 | 2 | 3 | 1 | 6 | **Fail** | 2026-07-27 | |
| 21 | Channel 5 | https://www.channel5.com/ | 79 | 0 | 0 | 3 | 0 | 3 | **Fail** | 2026-07-27 | |
| 22 | Lidl UK | https://www.lidl.co.uk/ | 78 | 0 | 1 | 1 | 0 | 2 | **Fail** | 2026-07-27 | |
| 23 | Tesco | https://www.tesco.com/ | 57 | 0 | 1 | 4 | 0 | 5 | **Fail** | 2026-07-27 | |
| 24 | Iceland | https://www.iceland.co.uk/ | 57 | 0 | 1 | 4 | 0 | 5 | **Fail** | 2026-07-27 | |
| 25 | Wikipedia (en Main Page) | https://en.wikipedia.org/wiki/Main_Page | 91 | 0 | 0 | 0 | 3 | 3 | **Pass** | 2026-07-27 | |

**Verification:** Independent API scans where noted; compare your UI if scores differ (retail/TV pages change often).

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

---

## Out of scope for this batch

These URLs appear in `TEST_PLAN.md` as examples but were **not** run in this 15-site batch:

- https://example.com/
- https://www.w3.org/WAI/demos/bad/before/home.html

Use them for a future regression or “known good / known bad” comparison run.

---

## Adding more sites later

1. Scan in Lumen (live mode, demo off).  
2. Copy score + all four severity counts + total issues.  
3. Apply the Pass/Fail rule.  
4. Append row **#26+** and update **Summary count** and severity totals.

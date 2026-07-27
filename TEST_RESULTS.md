# Accessibility Scan Results Log

**Product:** Lumen Accessibility Checker  
**Purpose:** Record whether each **website** passed or failed based on automated accessibility findings (not whether the Lumen tool itself worked).  
**App:** http://localhost:4376  
**Updated:** July 2026

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

---

## Summary count

**Target sample size:** **10+ websites** (first 10 complete; continuing)

| Metric | Count |
|--------|------:|
| Target (initial) | 10 |
| Websites tested | 14 |
| Passed | 7 |
| Failed | 7 |

---

## Results table

| # | Website | URL | Score | Critical | Serious | Moderate | Minor | Total issues | Website result | Date | Tester |
|---|---------|-----|------:|---------:|--------:|---------:|------:|-------------:|----------------|------|--------|
| 1 | Google UK | https://www.google.co.uk/ | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 2 | YouTube | https://www.youtube.com/ | 0 | 4 | 0 | 0 | 0 | 4 | **Fail** | 2026-07-27 | |
| 3 | BBC Weather Southall | https://www.bbc.co.uk/weather/2637490 | 15 | 1 | 4 | 0 | 0 | 5 | **Fail** | 2026-07-27 | |
| 4 | BBC iPlayer | https://www.bbc.co.uk/iplayer | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 5 | BBC News | https://www.bbc.co.uk/news | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 6 | Disney+ UK | https://www.disneyplus.com/en-gb | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 7 | GitHub balisikh | https://github.com/balisikh | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 8 | ChatGPT | https://chatgpt.com | 60 | 1 | 1 | 0 | 0 | 2 | **Fail** | 2026-07-27 | |
| 9 | Spotify Web Player | https://open.spotify.com/ | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 10 | Google Maps | https://www.google.com/maps | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 11 | Google Mail (Gmail) | https://mail.google.com | 75 | 1 | 0 | 0 | 0 | 1 | **Fail** | 2026-07-27 | |
| 12 | Google Docs | https://docs.google.com | 75 | 1 | 0 | 0 | 0 | 1 | **Fail** | 2026-07-27 | Tester reported 0; verify scan 75 (see notes) |
| 13 | Google Sheets | https://sheets.google.com | 0 | 6 | 13 | 0 | 0 | 19 | **Fail** | 2026-07-27 | |
| 14 | Google Slides (Presentation) | https://slides.google.com | 0 | 9 | 13 | 0 | 0 | 22 | **Fail** | 2026-07-27 | |

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
- Mismatch likely from different URL, login state, or landing vs editor (0 needs many more axe findings).
- Failed on both outcomes (score &lt; 85 and/or critical ≥ 1).

### Google Sheets — Fail
- URL: https://sheets.google.com  
- Score **0**, **6 critical**, **13 serious**, 19 issues total (matches tester score 0; verified independently).
- Main findings: `aria-required-parent` (critical), `list` (serious).
- Failed because score &lt; 85 and critical ≥ 1.

### Google Slides (Presentation) — Fail
- URL: https://slides.google.com  
- Score **0**, **9 critical**, **13 serious**, 22 issues total (matches tester score 0; verified independently).
- Main findings: `aria-required-parent` (9), `list` (13).
- Failed because score &lt; 85 and critical ≥ 1.

---

## How to add the next site

1. Scan the site in Lumen.  
2. Copy Score + severity counts.  
3. Apply the Pass/Fail rule above.  
4. Add a new row in the results table.  
5. Update the **Summary count** (and raise **Target** if you go past 10).  

First 10 complete. Continuing as #11+.

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

**Target sample size:** **10 websites**

| Metric | Count |
|--------|------:|
| Target | 10 |
| Websites tested | 3 |
| Passed | 1 |
| Failed | 2 |
| Remaining | 7 |

---

## Results table

| # | Website | URL | Score | Critical | Serious | Moderate | Minor | Total issues | Website result | Date | Tester |
|---|---------|-----|------:|---------:|--------:|---------:|------:|-------------:|----------------|------|--------|
| 1 | Google UK | https://www.google.co.uk/ | 100 | 0 | 0 | 0 | 0 | 0 | **Pass** | 2026-07-27 | |
| 2 | YouTube | https://www.youtube.com/ | 0 | 4 | 0 | 0 | 0 | 4 | **Fail** | 2026-07-27 | |
| 3 | BBC Weather Southall | https://www.bbc.co.uk/weather/2637490 | 15 | 1 | 4 | 0 | 0 | 5 | **Fail** | 2026-07-27 | |
| 4 | example.com | https://example.com/ | | | | | | | Pending | | |
| 5 | W3C bad demo | https://www.w3.org/WAI/demos/bad/before/home.html | | | | | | | Pending | | |
| 6 | (other) | | | | | | | | Pending | | |

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

---

## How to add the next site

1. Scan the site in Lumen.  
2. Copy Score + severity counts.  
3. Apply the Pass/Fail rule above.  
4. Add a new row in the results table.  
5. Update the **Summary count**.  

Next suggested: **example.com**, then **W3C bad demo**.

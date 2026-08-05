/**
 * Canonical user-facing product copy for Lumen UI.
 * README and other docs point here — do not duplicate step/FAQ text elsewhere.
 */

export const PRODUCT_NAME = "Lumen";

/** Primary one-line product description (README, About, FAQs). */
export const PRODUCT_TAGLINE =
  "Scan any public page for WCAG accessibility issues, with optional AI fix guidance";

/** Secondary line for GitHub / docs — stack and headline features. */
export const PRODUCT_TECH_SUBLINE =
  "Built with Playwright + axe-core · JSON & PDF export · Batch dashboard";

export const DISCLAIMER_ASSISTIVE =
  "Automated axe results help you improve pages — not a legal WCAG certificate or full manual audit.";

export const DISCLAIMER_ASSISTIVE_SHORT =
  "Assistive findings only — not a legal accessibility certificate.";

/** One-line Pass/Fail rule (batch + live results). */
export const PASS_FAIL_RULE_LINE =
  "Pass: score ≥ 85 and critical = 0. Fail: otherwise.";

/** Inline rule fragment (live vs batch FAQ). */
export const PASS_FAIL_RULE_INLINE = "score ≥ 85 and critical = 0";

export const PASS_FAIL_RULE_FAQ =
  "Batch Pass / Fail (also shown on live results): Pass = score ≥ 85 and critical = 0. Fail = score below 85 or any critical issue. A Pass can still have moderate or minor issues to triage.";

export const DISCLAIMER_SCAN_LIMITS =
  "Findings are automated axe rules only. They help you improve accessibility but are not a legal WCAG certificate or a substitute for manual testing with assistive technology.";

export const PASS_FAIL_PASS_HEADING = "Pass (websites)";

export const PASS_FAIL_PASS_BODY =
  "score at least 85 and zero critical issues. Moderate or minor findings still need triage so the site stays a Pass.";

export const PASS_FAIL_LEGEND_PASS =
  "Pass — score at least 85 and zero critical issues. Teal row tint and badge.";

export const PASS_FAIL_LEGEND_FAIL =
  "Fail — score below 85 and/or one or more critical issues. Warm row tint and badge.";

export const URL_PUBLIC_HINT =
  "Public http or https URLs only — private and local addresses are blocked.";

export const SCORE_FORMULA =
  "each critical −25, serious −15, moderate −7, minor −3 (minimum 0). Zero issues = 100.";

export const SCORE_LABELS = "Strong (≥85), Fair (60–84), Needs work (<60).";

export const SCORE_BATCH_PASS_NOTE =
  "In our website test batches, Pass also requires zero critical issues.";

export const HOW_TO_USE_HEADING = "How to use Lumen";

export const HOW_TO_USE_LEDE =
  "Step-by-step from URL to report. Works the same in Light, Dark, and System theme.";

export const HOW_IT_WORKS_HEADING = "How Lumen checks a page";

export const FAQ_HEADING = "Common questions";

export const FAQ_LEDE =
  "About live scans — expand any item. Light / Dark / System theme affects display only, not scan results.";

export const BATCH_SNAPSHOT_NOTE =
  "Static snapshot — loads instantly and does not run scans.";

export const BATCH_NOTES_COLUMN_HINT =
  "Pass and Fail rows both use Notes & recommendations when there are issues to triage.";

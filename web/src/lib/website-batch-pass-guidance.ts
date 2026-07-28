/**
 * Notes and maintenance recommendations for batch Pass sites.
 * Sync with TEST_RESULTS.md — complements FAIL_SITE_GUIDANCE.
 */
export type PassSiteGuidance = {
  note?: string;
  recommendations: string[];
};

export const PASS_SITE_GUIDANCE: Record<number, PassSiteGuidance> = {
  1: {
    note: "Perfect automated score (0 issues).",
    recommendations: [
      "Use as a clean baseline when comparing other scans.",
      "Re-scan after major Google UI changes — automated results can shift.",
      "Keep manual spot-checks; Pass is not a formal WCAG certificate.",
    ],
  },
  4: {
    note: "Pass with 2 moderate issues (score 86).",
    recommendations: [
      "Open each moderate issue in Lumen Rule help and fix when convenient.",
      "Re-scan to confirm critical stays at 0 and score stays ≥ 85.",
      "Prioritize any new critical findings before release.",
    ],
  },
  5: {
    note: "Pass with 1 moderate issue (score 93).",
    recommendations: [
      "Triage the moderate finding; low effort may lift score further.",
      "Re-scan after BBC template or component updates.",
      "Export JSON if tracking regressions in a ticket.",
    ],
  },
  6: {
    note: "Clean scan — 100 score, zero issues.",
    recommendations: [
      "Re-scan periodically; streaming sites update often.",
      "Use as a Pass reference alongside Google UK / Maps.",
      "Still validate key flows manually (keyboard, captions, etc.).",
    ],
  },
  7: {
    note: "Profile page only — not full github.com.",
    recommendations: [
      "Re-scan if GitHub changes profile markup or ARIA patterns.",
      "Scan other URLs separately if testing org/repo pages.",
      "Maintain zero critical on re-scan to keep batch Pass.",
    ],
  },
  10: {
    note: "Clean scan — 100 score, zero issues.",
    recommendations: [
      "Maps is heavy JS — re-scan after Google updates the app shell.",
      "Compare against other clean Pass sites if scores diverge.",
      "Document scan date when reporting stakeholders (snapshot ages).",
    ],
  },
  25: {
    note: "Pass with 3 minor issues (score 91).",
    recommendations: [
      "Minors are optional polish; fix when editing related components.",
      "Re-scan after MediaWiki skin or main-page layout changes.",
      "Confirm critical count stays 0 on each batch re-run.",
    ],
  },
  26: {
    note: "Regression URL — Pass with 2 moderate (score 86).",
    recommendations: [
      "Keep in CI smoke tests and batch validate:batch checks.",
      "Fix moderates if using example.com as a “known good” demo.",
      "Pair with W3C bad demo (#27) for contrast in testing docs.",
    ],
  },
};

export function passGuidanceForSite(id: number): PassSiteGuidance | undefined {
  return PASS_SITE_GUIDANCE[id];
}

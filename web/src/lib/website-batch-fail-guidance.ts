/**
 * Context notes and recommended follow-up for failed batch sites.
 * Sync with TEST_RESULTS.md — not auto-generated from scans.
 */
export type FailSiteGuidance = {
  note?: string;
  furtherActions: string[];
};

export const FAIL_SITE_GUIDANCE: Record<number, FailSiteGuidance> = {
  2: {
    furtherActions: [
      "Fix `aria-allowed-attr` on main nav links (remove or correct invalid ARIA).",
      "Re-scan in Lumen and use Rule help on each critical issue.",
      "Target zero critical issues, then re-check score ≥ 85.",
    ],
  },
  3: {
    furtherActions: [
      "Fix critical `aria-required-attr` first.",
      "Resolve `aria-hidden-focus` and `color-contrast` (serious) on weather UI.",
      "Re-scan after BBC deploys changes (page content changes often).",
    ],
  },
  8: {
    furtherActions: [
      "Correct unsupported ARIA (`aria-allowed-attr`, critical).",
      "Improve text contrast (`color-contrast`, serious).",
      "Re-scan; export JSON to track before/after.",
    ],
  },
  11: {
    note: "Sign-in surface (not inbox).",
    furtherActions: [
      "Add accessible name to the failing `select` (`select-name`, critical).",
      "Optional: run a separate logged-in scan if testing the full app.",
      "Re-scan public sign-in URL after fix.",
    ],
  },
  12: {
    furtherActions: [
      "Same pattern as Gmail: fix `select-name` on the scanned surface.",
      "Confirm whether scan hit sign-in vs editor (tester 0 vs verify 75).",
      "Re-scan and align table row with one chosen URL/state.",
    ],
  },
  13: {
    furtherActions: [
      "Fix `aria-required-parent` (critical) — place ARIA roles in valid parents.",
      "Fix `list` (serious) — use proper list markup.",
      "Re-scan; prioritize all critical issues before score work.",
    ],
  },
  14: {
    furtherActions: [
      "Fix `aria-required-parent` (9× critical) and `list` (13× serious).",
      "Re-scan after structural ARIA/list fixes.",
      "Export issues from Lumen for dev handoff.",
    ],
  },
  15: {
    furtherActions: [
      "Add `lang` on `<html>` (`html-has-lang`, serious).",
      "Fix zoom/scaling (`meta-viewport`, moderate).",
      "Re-scan — no criticals; raising score above 85 is the Pass gap.",
    ],
  },
  16: {
    note: "Score/bot pages vary; severities may need refresh.",
    furtherActions: [
      "Re-scan in Lumen when page loads fully (avoid captcha/bot shell).",
      "Fix reported serious/moderate issues (see export JSON).",
      "Log one consistent score + severities row after confirmatory scan.",
    ],
  },
  17: {
    furtherActions: [
      "Fix `aria-hidden-focus` (9× serious) — remove focus from hidden content.",
      "Address `page-has-heading-one`, `landmark-one-main`, `aria-allowed-role`.",
      "Re-scan until score ≥ 85 (no critical blockers).",
    ],
  },
  18: {
    furtherActions: [
      "Improve landmarks/regions (`region`, `landmark-unique`, `landmark-one-main`).",
      "Fix `heading-order` and `meta-viewport`.",
      "Re-scan — failures are moderate-heavy; batch Pass needs score ≥ 85.",
    ],
  },
  19: {
    furtherActions: [
      "Fix `region`, `meta-viewport`, and `landmark-one-main`.",
      "Re-scan (score 79 — close to Pass threshold).",
    ],
  },
  20: {
    furtherActions: [
      "Run fresh Lumen scan; work through serious then moderate issues.",
      "Use Rule help links per issue; re-scan after fixes.",
    ],
  },
  21: {
    furtherActions: [
      "Fix moderate landmark/region/viewport issues (same pattern as ITVX).",
      "Re-scan to push score from 79 to ≥ 85.",
    ],
  },
  22: {
    furtherActions: [
      "Fix 1 serious + 1 moderate finding from Lumen export.",
      "Re-scan (score 78 — just below Pass).",
    ],
  },
  23: {
    furtherActions: [
      "Fix 1 serious + 4 moderate issues (structure/contrast/landmarks per rules).",
      "Re-scan after retailer template updates.",
    ],
  },
  24: {
    furtherActions: [
      "Same severity mix as Tesco — fix serious first, then moderates.",
      "Re-scan for score improvement from 57.",
    ],
  },
  27: {
    note: "Known-bad demo (intentional).",
    furtherActions: [
      "Use as regression only — compare fixed “after” demo when available.",
      "For learning: fix `image-alt`, `region`, `link-name`, contrast, lang.",
      "Not a production site to remediate.",
    ],
  },
  28: {
    furtherActions: [
      "Triage 5 serious then highest-impact moderate rules (100 issues).",
      "Re-scan in Lumen; filter by severity in results.",
      "Enable AI tips on server for top-issue fix ideas if configured.",
    ],
  },
};

export function guidanceForSite(id: number): FailSiteGuidance | undefined {
  return FAIL_SITE_GUIDANCE[id];
}

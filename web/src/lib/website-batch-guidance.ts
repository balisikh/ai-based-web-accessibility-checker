import type { WebsiteBatchResult } from "./website-batch-results";
import {
  guidanceForSite as failGuidanceForSite,
  type FailSiteGuidance,
} from "./website-batch-fail-guidance";
import {
  passGuidanceForSite,
  type PassSiteGuidance,
} from "./website-batch-pass-guidance";
import { websiteBatchPass } from "./website-pass-fail";

export type BatchSiteGuidanceView = {
  pass: boolean;
  kicker: string;
  note?: string;
  recommendations: string[];
  /** True when the site still has axe findings to triage (Pass with issues or Fail). */
  hasFollowUpWork: boolean;
};

function fromFail(g: FailSiteGuidance, rowNote?: string): BatchSiteGuidanceView {
  return {
    pass: false,
    kicker: "Recommended actions",
    note: rowNote ?? g.note,
    recommendations: g.furtherActions,
    hasFollowUpWork: true,
  };
}

function fromPass(
  g: PassSiteGuidance,
  rowNote: string | undefined,
  hasIssues: boolean,
): BatchSiteGuidanceView {
  return {
    pass: true,
    kicker: hasIssues ? "Recommended actions" : "Maintain Pass",
    note: rowNote ?? g.note,
    recommendations: g.recommendations,
    hasFollowUpWork: hasIssues,
  };
}

/** Unified notes + recommendations for batch table (all 28 sites). */
export function batchGuidanceForRow(
  row: WebsiteBatchResult,
): BatchSiteGuidanceView {
  const pass = websiteBatchPass(row.score, row.critical);
  const hasIssues = row.totalIssues > 0;

  if (pass) {
    const guided = passGuidanceForSite(row.id);
    if (guided) return fromPass(guided, row.note, hasIssues);
    return {
      pass: true,
      kicker: hasIssues ? "Recommended actions" : "Maintain Pass",
      note: row.note,
      recommendations: hasIssues
        ? [
            "Triage non-critical issues in Lumen (Rule help + export JSON).",
            "Re-scan to confirm score ≥ 85 and critical stays 0.",
            "Fix new critical findings before release.",
          ]
        : [
            "Re-scan in Lumen to confirm score ≥ 85 and critical = 0.",
            "Export JSON when sharing results with your team.",
          ],
      hasFollowUpWork: hasIssues,
    };
  }

  const guided = failGuidanceForSite(row.id);
  if (guided) return fromFail(guided, row.note);

  return {
    pass: false,
    kicker: "Recommended actions",
    note: row.note,
    recommendations: [
      "Re-scan in Lumen and work critical issues first, then serious/moderate.",
      "Use Rule help and Export JSON for developer handoff.",
    ],
    hasFollowUpWork: true,
  };
}

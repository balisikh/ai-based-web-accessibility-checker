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
};

function fromFail(g: FailSiteGuidance, rowNote?: string): BatchSiteGuidanceView {
  return {
    pass: false,
    kicker: "Recommended actions",
    note: rowNote ?? g.note,
    recommendations: g.furtherActions,
  };
}

function fromPass(g: PassSiteGuidance, rowNote?: string): BatchSiteGuidanceView {
  return {
    pass: true,
    kicker: "Maintain Pass",
    note: rowNote ?? g.note,
    recommendations: g.recommendations,
  };
}

/** Unified notes + recommendations for batch table (all 28 sites). */
export function batchGuidanceForRow(
  row: WebsiteBatchResult,
): BatchSiteGuidanceView {
  const pass = websiteBatchPass(row.score, row.critical);

  if (pass) {
    const guided = passGuidanceForSite(row.id);
    if (guided) return fromPass(guided, row.note);
    return {
      pass: true,
      kicker: "Maintain Pass",
      note: row.note,
      recommendations: [
        "Re-scan in Lumen to confirm score ≥ 85 and critical = 0.",
        "Export JSON when sharing results with your team.",
      ],
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
  };
}

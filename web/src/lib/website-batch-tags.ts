import type { WebsiteBatchResult } from "./website-batch-results";

export const BATCH_TAG_LABELS: Record<string, string> = {
  "benchmark-pass": "Benchmark pass",
  "clean-scan": "Clean scan",
  "pass-with-issues": "Pass with issues",
  "sign-in-shell": "Sign-in shell",
  "critical-blocker": "Critical blocker",
  "score-only-fail": "Score-only fail",
  "known-bad-control": "Known-bad control",
  "unstable-scan": "Re-verify scan",
};

/** Display labels for batch UI (derived from scan snapshot). */
export function tagsForBatchSite(row: WebsiteBatchResult): string[] {
  const tags: string[] = [];
  const pass = row.score >= 85 && row.critical === 0;

  if (row.id === 27) tags.push("known-bad-control");
  if (row.id === 1 || row.id === 26) tags.push("benchmark-pass");
  if (pass && row.totalIssues === 0) tags.push("clean-scan");
  if (pass && row.totalIssues > 0) tags.push("pass-with-issues");
  if ([11, 12, 13, 14].includes(row.id)) tags.push("sign-in-shell");
  if ([9, 16].includes(row.id)) tags.push("unstable-scan");
  if (!pass && row.critical >= 1) tags.push("critical-blocker");
  if (!pass && row.critical === 0) tags.push("score-only-fail");

  return tags;
}

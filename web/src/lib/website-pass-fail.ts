/** Batch Pass/Fail rule — same as TEST_RESULTS.md / TEST_PLAN.md WEB-02. */
export function websiteBatchPass(score: number, critical: number): boolean {
  return score >= 85 && critical === 0;
}

export type WebsiteBatchOutcome = "pass" | "fail";

export function websiteBatchOutcome(
  score: number,
  critical: number,
): WebsiteBatchOutcome {
  return websiteBatchPass(score, critical) ? "pass" : "fail";
}

/** Short reason for UI callouts (batch rule only). */
export function websiteBatchFailReason(
  score: number,
  critical: number,
): string | null {
  if (websiteBatchPass(score, critical)) return null;
  const parts: string[] = [];
  if (critical >= 1) {
    parts.push(
      `${critical} critical ${critical === 1 ? "issue" : "issues"}`,
    );
  }
  if (score < 85) {
    parts.push(`score ${score} (need ≥ 85)`);
  }
  return parts.join("; ");
}

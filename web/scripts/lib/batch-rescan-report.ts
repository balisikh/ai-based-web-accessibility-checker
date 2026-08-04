/** Row shape written by batch-rescan and read by apply-batch-rescan. */
export type BatchRescanReportRow = {
  id: number;
  name: string;
  url: string;
  ok: boolean;
  error?: string;
  score?: number;
  critical?: number;
  serious?: number;
  moderate?: number;
  minor?: number;
  totalIssues?: number;
};

/** Matches batch-rescan-report.json (summary optional for older reports). */
export type BatchRescanReport = {
  generatedAt: string;
  durationSec?: number;
  rows: BatchRescanReportRow[];
  summary?: {
    ok: number;
    failed: number;
    unchangedScore?: number;
    changedScore?: number;
  };
};

export function rescanCounts(report: BatchRescanReport): {
  ok: number;
  failed: number;
} {
  const ok = report.summary?.ok ?? report.rows.filter((r) => r.ok).length;
  const failed =
    report.summary?.failed ?? report.rows.filter((r) => !r.ok).length;
  return { ok, failed };
}

export function buildRescanSummary(
  rows: Array<{ ok: boolean; delta?: { score: number | null } }>,
): NonNullable<BatchRescanReport["summary"]> {
  return {
    ok: rows.filter((r) => r.ok).length,
    failed: rows.filter((r) => !r.ok).length,
    unchangedScore: rows.filter((r) => r.ok && r.delta?.score === 0).length,
    changedScore: rows.filter((r) => r.ok && r.delta?.score !== 0).length,
  };
}

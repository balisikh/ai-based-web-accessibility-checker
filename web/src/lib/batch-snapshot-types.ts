import type { WebsiteBatchResult } from "./website-batch-results";

/** Shared batch snapshot types — safe for client and server (no Node.js imports). */

export type BatchSnapshotMeta = {
  date: string;
  rescannedOk: number;
  rescannedFailed: number;
  total: number;
};

export type WebsiteBatchSummary = {
  tested: number;
  passed: number;
  failed: number;
  passedClean: number;
  passedWithIssues: number;
  totalCritical: number;
  totalSerious: number;
  totalModerate: number;
  totalMinor: number;
  totalIssues: number;
};

export type BatchSnapshot = {
  generatedAt: string;
  date: string;
  meta: BatchSnapshotMeta;
  results: WebsiteBatchResult[];
  summary: WebsiteBatchSummary;
};

export function batchResyncDetailFromMeta(meta: BatchSnapshotMeta): string {
  const { rescannedOk, total, rescannedFailed } = meta;
  if (rescannedFailed === 0) {
    return `all ${total} sites scanned live`;
  }
  return `${rescannedOk}/${total} sites scanned live · ${rescannedFailed} kept prior snapshot`;
}

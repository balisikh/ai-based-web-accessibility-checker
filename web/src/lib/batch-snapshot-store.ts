import fs from "node:fs/promises";
import path from "node:path";
import { unstable_noStore as noStore } from "next/cache";
import { websiteBatchPass } from "./website-pass-fail";
import {
  BATCH_SNAPSHOT_DATE,
  BATCH_SNAPSHOT_META,
  WEBSITE_BATCH_RESULTS,
  type WebsiteBatchResult,
} from "./website-batch-results";

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

const SNAPSHOT_PATH = path.join(
  process.cwd(),
  "data",
  "batch-live-snapshot.json",
);

export function computeBatchSummary(
  results: WebsiteBatchResult[],
): WebsiteBatchSummary {
  return {
    tested: results.length,
    passed: results.filter((r) => websiteBatchPass(r.score, r.critical)).length,
    failed: results.filter((r) => !websiteBatchPass(r.score, r.critical))
      .length,
    passedClean: results.filter(
      (r) => websiteBatchPass(r.score, r.critical) && r.totalIssues === 0,
    ).length,
    passedWithIssues: results.filter(
      (r) => websiteBatchPass(r.score, r.critical) && r.totalIssues > 0,
    ).length,
    totalCritical: results.reduce((n, r) => n + r.critical, 0),
    totalSerious: results.reduce((n, r) => n + r.serious, 0),
    totalModerate: results.reduce((n, r) => n + r.moderate, 0),
    totalMinor: results.reduce((n, r) => n + r.minor, 0),
    totalIssues: results.reduce((n, r) => n + r.totalIssues, 0),
  };
}

function staticSnapshot(): BatchSnapshot {
  return {
    generatedAt: `${BATCH_SNAPSHOT_DATE}T00:00:00.000Z`,
    date: BATCH_SNAPSHOT_DATE,
    meta: { ...BATCH_SNAPSHOT_META },
    results: WEBSITE_BATCH_RESULTS,
    summary: computeBatchSummary(WEBSITE_BATCH_RESULTS),
  };
}

async function readLiveSnapshot(): Promise<BatchSnapshot | null> {
  try {
    const raw = await fs.readFile(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(raw) as BatchSnapshot;
    if (
      !parsed?.results?.length ||
      !parsed.meta ||
      !parsed.summary ||
      !parsed.date
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Prefer runtime JSON snapshot (after UI refresh); fall back to baked-in TS data. */
export async function getBatchSnapshot(): Promise<BatchSnapshot> {
  noStore();
  const live = await readLiveSnapshot();
  return live ?? staticSnapshot();
}

export async function saveBatchSnapshot(snapshot: BatchSnapshot): Promise<void> {
  await fs.mkdir(path.dirname(SNAPSHOT_PATH), { recursive: true });
  await fs.writeFile(SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2), "utf8");
}

export function batchResyncDetailFromMeta(meta: BatchSnapshotMeta): string {
  const { rescannedOk, total, rescannedFailed } = meta;
  if (rescannedFailed === 0) {
    return `all ${total} sites scanned live`;
  }
  return `${rescannedOk}/${total} sites scanned live · ${rescannedFailed} kept prior snapshot`;
}

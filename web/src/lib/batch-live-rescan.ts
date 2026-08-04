import { analyzeUrlWithAxe } from "./live-scan";
import { countBySeverity, scoreFromIssues } from "./store";
import {
  getBatchRescanConcurrency,
  getBatchRescanSiteTimeoutMs,
} from "./batch-refresh-config";
import { setBatchRefreshProgress } from "./batch-refresh-job";
import {
  computeBatchSummary,
  getBatchSnapshot,
  type BatchSnapshot,
  type BatchSnapshotMeta,
} from "./batch-snapshot-store";
import type { WebsiteBatchResult } from "./website-batch-results";

type RescanOutcome =
  | { ok: true; row: WebsiteBatchResult }
  | { ok: false; row: WebsiteBatchResult; error: string };

async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${Math.round(ms / 1000)}s`)),
          ms,
        );
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

async function rescanSite(
  site: WebsiteBatchResult,
  snapshotDate: string,
): Promise<RescanOutcome> {
  try {
    const { issues } = await withTimeout(
      analyzeUrlWithAxe(`batch_refresh_${site.id}`, site.url),
      getBatchRescanSiteTimeoutMs(),
      site.name,
    );
    const counts = countBySeverity(issues);
    const score = scoreFromIssues(issues);
    const totalIssues = issues.length;

    return {
      ok: true,
      row: {
        id: site.id,
        name: site.name,
        url: site.url,
        score,
        critical: counts.critical,
        serious: counts.serious,
        moderate: counts.moderate,
        minor: counts.minor,
        totalIssues,
        date: snapshotDate,
        note: site.note,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const note = site.note
      ? `${site.note}; rescan ${snapshotDate} failed — kept prior snapshot`
      : `Rescan ${snapshotDate} failed (${message.slice(0, 80)}) — kept prior snapshot`;

    return {
      ok: false,
      error: message,
      row: {
        ...site,
        date: snapshotDate,
        note,
      },
    };
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker(),
  );
  await Promise.all(workers);
  return results;
}

/** Live Playwright + axe rescan for all batch sites; failed rows keep prior counts. */
export async function runBatchLiveRescan(): Promise<BatchSnapshot> {
  const generatedAt = new Date().toISOString();
  const snapshotDate = generatedAt.slice(0, 10);
  const prior = await getBatchSnapshot();
  const baseRows = prior.results;
  const total = baseRows.length;

  const outcomes = await mapWithConcurrency(
    baseRows,
    getBatchRescanConcurrency(),
    async (site, index) => {
      setBatchRefreshProgress({
        current: index + 1,
        total,
        siteName: site.name,
      });
      const outcome = await rescanSite(site, snapshotDate);
      return outcome;
    },
  );

  const results = outcomes.map((o) => o.row);
  const rescannedOk = outcomes.filter((o) => o.ok).length;
  const rescannedFailed = outcomes.length - rescannedOk;

  const meta: BatchSnapshotMeta = {
    date: snapshotDate,
    rescannedOk,
    rescannedFailed,
    total: baseRows.length,
  };

  return {
    generatedAt,
    date: snapshotDate,
    meta,
    results,
    summary: computeBatchSummary(results),
  };
}

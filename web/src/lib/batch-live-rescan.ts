import { analyzeUrlWithAxe } from "./live-scan";
import { countBySeverity, scoreFromIssues } from "./store";
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

async function rescanSite(
  site: WebsiteBatchResult,
  snapshotDate: string,
): Promise<RescanOutcome> {
  try {
    const { issues } = await analyzeUrlWithAxe(
      `batch_refresh_${site.id}`,
      site.url,
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

/** Live Playwright + axe rescan for all batch sites; failed rows keep prior counts. */
export async function runBatchLiveRescan(): Promise<BatchSnapshot> {
  const generatedAt = new Date().toISOString();
  const snapshotDate = generatedAt.slice(0, 10);
  const prior = await getBatchSnapshot();
  const baseRows = prior.results;

  const outcomes: RescanOutcome[] = [];
  for (const site of baseRows) {
    outcomes.push(await rescanSite(site, snapshotDate));
  }

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

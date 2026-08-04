import type { BatchSnapshotMeta, WebsiteBatchSummary } from "./batch-snapshot-types";

export type BatchRefreshProgress = {
  current: number;
  total: number;
  siteName?: string;
};

export type BatchRefreshJobState =
  | {
      status: "idle";
    }
  | {
      status: "running";
      startedAt: string;
      progress: BatchRefreshProgress;
    }
  | {
      status: "done";
      startedAt: string;
      finishedAt: string;
      date: string;
      meta: BatchSnapshotMeta;
      summary: WebsiteBatchSummary;
    }
  | {
      status: "failed";
      startedAt: string;
      finishedAt: string;
      error: string;
    };

const globalJob = globalThis as typeof globalThis & {
  __lumenBatchRefreshJob?: BatchRefreshJobState;
  __lumenBatchRefreshRun?: Promise<void>;
};

export function getBatchRefreshJob(): BatchRefreshJobState {
  return globalJob.__lumenBatchRefreshJob ?? { status: "idle" };
}

export function isBatchRefreshRunning(): boolean {
  return globalJob.__lumenBatchRefreshJob?.status === "running";
}

export function setBatchRefreshProgress(progress: BatchRefreshProgress): void {
  const job = globalJob.__lumenBatchRefreshJob;
  if (job?.status === "running") {
    job.progress = progress;
  }
}

export async function runBatchRefreshJob(work: () => Promise<{
  date: string;
  meta: BatchSnapshotMeta;
  summary: WebsiteBatchSummary;
}>): Promise<void> {
  if (globalJob.__lumenBatchRefreshRun) {
    return globalJob.__lumenBatchRefreshRun;
  }

  const startedAt = new Date().toISOString();
  globalJob.__lumenBatchRefreshJob = {
    status: "running",
    startedAt,
    progress: { current: 0, total: 28 },
  };

  globalJob.__lumenBatchRefreshRun = (async () => {
    try {
      const result = await work();
      globalJob.__lumenBatchRefreshJob = {
        status: "done",
        startedAt,
        finishedAt: new Date().toISOString(),
        date: result.date,
        meta: result.meta,
        summary: result.summary,
      };
    } catch (error) {
      globalJob.__lumenBatchRefreshJob = {
        status: "failed",
        startedAt,
        finishedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error),
      };
    } finally {
      globalJob.__lumenBatchRefreshRun = undefined;
    }
  })();

  return globalJob.__lumenBatchRefreshRun;
}

export function clearBatchRefreshJobIfDone(): void {
  const job = globalJob.__lumenBatchRefreshJob;
  if (job?.status === "done" || job?.status === "failed") {
    globalJob.__lumenBatchRefreshJob = { status: "idle" };
  }
}

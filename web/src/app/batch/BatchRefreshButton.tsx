"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

type RefreshState = "idle" | "loading" | "done" | "error";

type BatchRefreshJobResponse = {
  job?: {
    status: "idle" | "running" | "done" | "failed";
    progress?: { current: number; total: number; siteName?: string };
    date?: string;
    error?: string;
  };
};

type BatchRefreshButtonProps = {
  /** When false (default production), button is visible but explains scheduled/CLI sync. */
  enabled?: boolean;
};

function formatProgress(progress?: {
  current: number;
  total: number;
  siteName?: string;
}): string {
  if (!progress) {
    return "Rescanning all 28 sites in the background…";
  }
  if (progress.siteName) {
    return `Scanning ${progress.siteName} (${progress.current}/${progress.total})…`;
  }
  return `Rescanning ${progress.current}/${progress.total}…`;
}

export function BatchRefreshButton({ enabled = true }: BatchRefreshButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<RefreshState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const pollJob = useCallback(async () => {
    const res = await fetch("/api/batch/refresh", { cache: "no-store" });
    const body = (await res.json().catch(() => ({}))) as BatchRefreshJobResponse;
    const job = body.job;

    if (!job || job.status === "idle") {
      return;
    }

    if (job.status === "running") {
      setMessage(formatProgress(job.progress));
      return;
    }

    stopPolling();

    if (job.status === "done") {
      setMessage(
        job.date
          ? `Snapshot updated (${job.date}). Reloading…`
          : "Snapshot updated. Reloading…",
      );
      setState("done");
      router.refresh();
      return;
    }

    setMessage(job.error ?? "Batch refresh failed.");
    setState("error");
  }, [router, stopPolling]);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      setMessage(
        "Live refresh runs on this server when BATCH_REFRESH_ENABLED=1. Committed snapshots update via npm run batch:sync or the weekly GitHub batch-rescan workflow.",
      );
      setState("error");
      return;
    }

    stopPolling();
    setState("loading");
    setMessage("Starting background rescan of all 28 sites…");

    try {
      const res = await fetch("/api/batch/refresh", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        retryAfterSec?: number;
        job?: BatchRefreshJobResponse["job"];
      };

      if (res.status === 409 && body.job?.status === "running") {
        setMessage(formatProgress(body.job.progress));
        pollRef.current = setInterval(() => {
          void pollJob();
        }, 2000);
        return;
      }

      if (!res.ok && res.status !== 202) {
        const detail =
          body.error ??
          (res.status === 429
            ? "Refresh rate limit reached."
            : "Refresh failed.");
        const retry =
          body.retryAfterSec !== undefined
            ? ` Try again in ${Math.ceil(body.retryAfterSec / 60)} min.`
            : "";
        setMessage(`${detail}${retry}`);
        setState("error");
        return;
      }

      setMessage(formatProgress(body.job?.progress));
      pollRef.current = setInterval(() => {
        void pollJob();
      }, 2000);
      void pollJob();
    } catch {
      setMessage("Network error — could not reach the refresh API.");
      setState("error");
    }
  }, [enabled, pollJob, stopPolling]);

  const busy = state === "loading";

  return (
    <div className="batch-refresh-wrap">
      <button
        type="button"
        className="batch-refresh-btn"
        onClick={onRefresh}
        disabled={busy}
        aria-busy={busy}
        aria-live="polite"
        title={
          enabled
            ? "Run a full live rescan of all 28 batch sites (background job)"
            : "Live refresh disabled on this host — use batch:sync or scheduled CI"
        }
      >
        {busy ? "Refreshing snapshot…" : "Refresh snapshot"}
      </button>
      {message ? (
        <p
          className={`batch-refresh-status batch-refresh-status-${state}`}
          role="status"
        >
          {message}
        </p>
      ) : !enabled ? (
        <p className="batch-refresh-status batch-refresh-status-idle">
          Snapshot date syncs from git via weekly CI rescan or{" "}
          <code>npm run batch:sync</code>.
        </p>
      ) : null}
    </div>
  );
}

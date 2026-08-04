"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

type RefreshState = "idle" | "loading" | "done" | "error";

type BatchRefreshButtonProps = {
  /** When false (default production), button is visible but explains scheduled/CLI sync. */
  enabled?: boolean;
};

export function BatchRefreshButton({ enabled = true }: BatchRefreshButtonProps) {
  const router = useRouter();
  const [state, setState] = useState<RefreshState>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const onRefresh = useCallback(async () => {
    if (!enabled) {
      setMessage(
        "Live refresh runs on this server when BATCH_REFRESH_ENABLED=1. Committed snapshots update via npm run batch:sync or the weekly GitHub batch-rescan workflow.",
      );
      setState("error");
      return;
    }

    setState("loading");
    setMessage("Rescanning all 28 sites — this may take several minutes…");

    try {
      const res = await fetch("/api/batch/refresh", { method: "POST" });
      const body = (await res.json().catch(() => ({}))) as {
        error?: string;
        retryAfterSec?: number;
        date?: string;
      };

      if (!res.ok) {
        const detail =
          body.error ??
          (res.status === 429
            ? "Refresh rate limit reached."
            : "Refresh failed.");
        const retry =
          body.retryAfterSec !== undefined
            ? ` Try again in ${body.retryAfterSec}s.`
            : "";
        setMessage(`${detail}${retry}`);
        setState("error");
        return;
      }

      setMessage(
        body.date
          ? `Snapshot updated (${body.date}). Reloading…`
          : "Snapshot updated. Reloading…",
      );
      setState("done");
      router.refresh();
    } catch {
      setMessage("Network error — could not reach the refresh API.");
      setState("error");
    }
  }, [enabled, router]);

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
            ? "Run a full live rescan of all 28 batch sites"
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

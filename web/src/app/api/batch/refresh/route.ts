import { NextResponse } from "next/server";
import {
  getBatchRefreshRateLimit,
  isBatchRefreshEnabled,
} from "@/lib/batch-refresh-config";
import {
  clearBatchRefreshJobIfDone,
  getBatchRefreshJob,
  isBatchRefreshRunning,
  runBatchRefreshJob,
} from "@/lib/batch-refresh-job";
import { runBatchLiveRescan } from "@/lib/batch-live-rescan";
import { saveBatchSnapshot } from "@/lib/batch-snapshot-store";
import {
  checkRateLimitWithOptions,
  getClientIp,
  rateLimitHeaders,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 900;

/** Poll refresh progress (non-blocking). */
export async function GET() {
  if (!isBatchRefreshEnabled()) {
    return NextResponse.json(
      { error: "Batch refresh is disabled." },
      { status: 503 },
    );
  }

  clearBatchRefreshJobIfDone();
  const job = getBatchRefreshJob();
  return NextResponse.json({ job });
}

/** Start a background batch rescan — returns immediately while work continues. */
export async function POST(request: Request) {
  if (!isBatchRefreshEnabled()) {
    return NextResponse.json(
      {
        error:
          "Batch refresh is disabled. Set BATCH_REFRESH_ENABLED=1 for self-hosted deployments.",
      },
      { status: 503 },
    );
  }

  if (isBatchRefreshRunning()) {
    return NextResponse.json(
      {
        error: "A batch refresh is already in progress.",
        job: getBatchRefreshJob(),
      },
      { status: 409 },
    );
  }

  const ip = getClientIp(request);
  const rateOpts = getBatchRefreshRateLimit();
  const rate = checkRateLimitWithOptions(`batch-refresh:${ip}`, rateOpts);

  if (!rate.ok) {
    return NextResponse.json(
      {
        error: "Batch refresh was run recently. Please wait before trying again.",
        retryAfterSec: rate.retryAfterSec,
      },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  void runBatchRefreshJob(async () => {
    const snapshot = await runBatchLiveRescan();
    await saveBatchSnapshot(snapshot);
    return {
      date: snapshot.date,
      meta: snapshot.meta,
      summary: snapshot.summary,
    };
  });

  return NextResponse.json(
    {
      ok: true,
      started: true,
      job: getBatchRefreshJob(),
      message:
        "Batch rescan started in the background. Poll GET /api/batch/refresh for progress.",
    },
    { status: 202, headers: rateLimitHeaders(rate) },
  );
}

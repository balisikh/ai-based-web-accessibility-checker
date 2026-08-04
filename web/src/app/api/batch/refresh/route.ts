import { NextResponse } from "next/server";
import { runBatchLiveRescan } from "@/lib/batch-live-rescan";
import { saveBatchSnapshot } from "@/lib/batch-snapshot-store";
import {
  checkRateLimitWithOptions,
  getClientIp,
  rateLimitHeaders,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
/** Full batch rescan (~28 sites) can take many minutes on a local server. */
export const maxDuration = 900;

const globalRefresh = globalThis as typeof globalThis & {
  __lumenBatchRefreshInFlight?: Promise<void>;
};

function isBatchRefreshEnabled(): boolean {
  if (process.env.BATCH_REFRESH_ENABLED === "0") return false;
  if (process.env.NODE_ENV === "development") return true;
  return process.env.BATCH_REFRESH_ENABLED === "1";
}

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

  const ip = getClientIp(request);
  const dev = process.env.NODE_ENV === "development";
  const rate = checkRateLimitWithOptions(`batch-refresh:${ip}`, {
    limit: dev ? 3 : 1,
    windowMs: dev ? 60_000 : 3_600_000,
  });

  if (!rate.ok) {
    return NextResponse.json(
      {
        error: "Batch refresh was run recently. Please wait before trying again.",
        retryAfterSec: rate.retryAfterSec,
      },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  if (globalRefresh.__lumenBatchRefreshInFlight) {
    return NextResponse.json(
      { error: "A batch refresh is already in progress." },
      { status: 409, headers: rateLimitHeaders(rate) },
    );
  }

  const work = (async () => {
    const snapshot = await runBatchLiveRescan();
    await saveBatchSnapshot(snapshot);
    return snapshot;
  })();

  globalRefresh.__lumenBatchRefreshInFlight = work.then(() => undefined);
  let snapshot;
  try {
    snapshot = await work;
  } finally {
    globalRefresh.__lumenBatchRefreshInFlight = undefined;
  }

  return NextResponse.json(
    {
      ok: true,
      date: snapshot.date,
      meta: snapshot.meta,
      summary: snapshot.summary,
    },
    { headers: rateLimitHeaders(rate) },
  );
}

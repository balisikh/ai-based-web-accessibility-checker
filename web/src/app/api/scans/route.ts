import { NextResponse } from "next/server";
import { createQueuedScan, runLiveScan } from "@/lib/scan-runner";
import { runDemoScan } from "@/lib/demo-scan";
import { toSummary } from "@/lib/store";
import { validateScanUrl } from "@/lib/validate-url";
import {
  checkRateLimit,
  getClientIp,
  rateLimitHeaders,
} from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(ip);
  if (!rate.ok) {
    return NextResponse.json(
      {
        error: "Too many scans from this IP. Please wait and try again.",
        retryAfterSec: rate.retryAfterSec,
      },
      { status: 429, headers: rateLimitHeaders(rate) },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be JSON." },
      { status: 400, headers: rateLimitHeaders(rate) },
    );
  }

  const urlValue =
    typeof body === "object" &&
    body !== null &&
    "url" in body &&
    typeof (body as { url: unknown }).url === "string"
      ? (body as { url: string }).url
      : "";

  const validation = validateScanUrl(urlValue);
  if (!validation.ok) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400, headers: rateLimitHeaders(rate) },
    );
  }

  const scan = await createQueuedScan(validation.url);

  if (process.env.USE_DEMO_SCAN === "1") {
    void runDemoScan(scan.id);
  } else {
    void runLiveScan(scan.id);
  }

  return NextResponse.json(
    { scanId: scan.id, scan: toSummary(scan) },
    { status: 201, headers: rateLimitHeaders(rate) },
  );
}

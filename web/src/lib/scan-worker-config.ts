/** Origin of the Playwright scan worker (Docker/Render). No trailing slash. */
export function getScanWorkerOrigin(): string | undefined {
  const raw = process.env.SCAN_WORKER_URL?.trim();
  if (!raw) return undefined;
  return raw.replace(/\/+$/, "");
}

export function getScanWorkerSecret(): string | undefined {
  const raw = process.env.SCAN_WORKER_SECRET?.trim();
  return raw || undefined;
}

/**
 * Vercel (or any UI host): delegate live scans to an external worker.
 * Requires shared DATABASE_URL so poll/export read the same scan rows.
 */
export function isScanWorkerProxyEnabled(): boolean {
  if (process.env.USE_DEMO_SCAN === "1") return false;
  return Boolean(getScanWorkerOrigin() && getScanWorkerSecret());
}

/** Worker host: accept authenticated POST /api/worker/scans/:id/run. */
export function isScanWorkerRunEndpointEnabled(): boolean {
  return Boolean(getScanWorkerSecret());
}

export type ScanExecutionMode = "demo" | "worker_proxy" | "local";

export function getScanExecutionMode(): ScanExecutionMode {
  if (process.env.USE_DEMO_SCAN === "1") return "demo";
  if (isScanWorkerProxyEnabled()) return "worker_proxy";
  return "local";
}

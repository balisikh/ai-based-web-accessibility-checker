import { scanWorkerAuthHeaders } from "./scan-worker-auth";
import { getScanWorkerOrigin } from "./scan-worker-config";

const TRIGGER_TIMEOUT_MS = 15_000;

/**
 * Ask the Docker/Render worker to run Playwright + axe for an existing queued scan.
 * The scan row must already exist in the shared database.
 */
export async function triggerScanOnWorker(scanId: string): Promise<void> {
  const origin = getScanWorkerOrigin();
  if (!origin) {
    throw new Error("SCAN_WORKER_URL is not configured.");
  }

  const url = `${origin}/api/worker/scans/${encodeURIComponent(scanId)}/run`;
  const response = await fetch(url, {
    method: "POST",
    headers: scanWorkerAuthHeaders(),
    signal: AbortSignal.timeout(TRIGGER_TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = (await response.text().catch(() => "")).slice(0, 240);
    throw new Error(
      detail
        ? `Scan worker returned ${response.status}: ${detail}`
        : `Scan worker returned ${response.status}.`,
    );
  }
}

/**
 * Proxy PDF export to the worker (Playwright PDF needs a container runtime).
 */
export async function fetchScanPdfFromWorker(scanId: string): Promise<Response> {
  const origin = getScanWorkerOrigin();
  if (!origin) {
    throw new Error("SCAN_WORKER_URL is not configured.");
  }

  const url = `${origin}/api/scans/${encodeURIComponent(scanId)}/export?format=pdf`;
  return fetch(url, {
    signal: AbortSignal.timeout(55_000),
  });
}

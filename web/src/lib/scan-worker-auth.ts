import { getScanWorkerSecret } from "./scan-worker-config";

export function verifyScanWorkerAuth(request: Request): boolean {
  const secret = getScanWorkerSecret();
  if (!secret) return false;

  const header = request.headers.get("authorization")?.trim();
  if (!header?.toLowerCase().startsWith("bearer ")) return false;

  const token = header.slice(7).trim();
  return token.length > 0 && token === secret;
}

export function scanWorkerAuthHeaders(): Record<string, string> {
  const secret = getScanWorkerSecret();
  if (!secret) {
    throw new Error("SCAN_WORKER_SECRET is not configured.");
  }
  return {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

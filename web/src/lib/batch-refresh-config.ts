import type { RateLimitOptions } from "./rate-limit";

/** Whether POST /api/batch/refresh and the batch page Refresh button are active. */
export function isBatchRefreshEnabled(): boolean {
  if (process.env.BATCH_REFRESH_ENABLED === "0") return false;
  if (process.env.NODE_ENV === "development") return true;
  return process.env.BATCH_REFRESH_ENABLED === "1";
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

/** Rate limit for starting a batch refresh (self-hosted can override via env). */
export function getBatchRefreshRateLimit(): RateLimitOptions {
  const enabledLocally = isBatchRefreshEnabled();
  const devLike =
    process.env.NODE_ENV === "development" ||
    (enabledLocally && process.env.CI !== "true");

  const defaultMax = devLike ? 5 : 1;
  const defaultWindowMs = devLike ? 10 * 60_000 : 3_600_000;

  return {
    limit: envInt("BATCH_REFRESH_RATE_LIMIT_MAX", defaultMax),
    windowMs: envInt("BATCH_REFRESH_RATE_LIMIT_WINDOW_MS", defaultWindowMs),
  };
}

/** Parallel live rescans during batch refresh (default 2 — balance speed vs RAM). */
export function getBatchRescanConcurrency(): number {
  return Math.min(6, Math.max(1, envInt("BATCH_RESCAN_CONCURRENCY", 2)));
}

/** Fail a single batch site after this many ms (avoid one URL blocking the whole run). */
export function getBatchRescanSiteTimeoutMs(): number {
  return envInt("BATCH_RESCAN_SITE_TIMEOUT_MS", 90_000);
}

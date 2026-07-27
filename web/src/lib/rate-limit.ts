type Bucket = {
  count: number;
  resetAt: number;
};

const globalRate = globalThis as typeof globalThis & {
  __lumenRateLimit?: Map<string, Bucket>;
};

function getBuckets(): Map<string, Bucket> {
  if (!globalRate.__lumenRateLimit) {
    globalRate.__lumenRateLimit = new Map();
  }
  return globalRate.__lumenRateLimit;
}

function envInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export type RateLimitResult =
  | { ok: true; remaining: number; limit: number; resetAt: number }
  | {
      ok: false;
      remaining: 0;
      limit: number;
      resetAt: number;
      retryAfterSec: number;
    };

/**
 * Fixed-window rate limit by client key (usually IP).
 * Defaults: 5 requests / 60s. Override with RATE_LIMIT_MAX / RATE_LIMIT_WINDOW_MS.
 */
export function checkRateLimit(key: string): RateLimitResult {
  const limit = envInt("RATE_LIMIT_MAX", 5);
  const windowMs = envInt("RATE_LIMIT_WINDOW_MS", 60_000);
  const now = Date.now();
  const buckets = getBuckets();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, limit, resetAt };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      limit,
      resetAt: existing.resetAt,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return {
    ok: true,
    remaining: Math.max(0, limit - existing.count),
    limit,
    resetAt: existing.resetAt,
  };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
    ...(result.ok
      ? {}
      : { "Retry-After": String(result.retryAfterSec) }),
  };
}

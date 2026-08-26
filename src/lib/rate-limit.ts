import "server-only";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * In-memory fixed-window limiter. Sufficient for a single-instance deployment
 * and for slowing down casual abuse; it does not survive restarts and is not
 * shared across instances. Swap for a durable store if the app is scaled out.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { allowed: false, retryAfterMs: existing.resetAt - now };
  }

  return { allowed: true, retryAfterMs: 0 };
}

/** Opportunistic cleanup so the map cannot grow without bound. */
export function pruneRateLimits() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

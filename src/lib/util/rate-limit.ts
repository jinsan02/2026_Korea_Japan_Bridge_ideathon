import 'server-only';

/**
 * Fixed-window rate limit for the analyse endpoint.
 *
 * The deployed demo is a public URL with a paid API key behind one route, so
 * that route cannot be unlimited. This is in-memory and therefore per-instance:
 * it stops a browser tab in a loop and a curious visitor, not a distributed
 * attacker. Anything stronger needs a shared store, which a two-day demo does
 * not have.
 *
 * Keyed by proxy-reported client address. That header can be forged, so this is
 * a cost guard, not a security control.
 */
const WINDOW_MS = 60_000;

interface Bucket {
  count: number;
  resetAt: number;
}

const globalBuckets = globalThis as unknown as {
  __aiDoorRateBuckets?: Map<string, Bucket>;
};

function buckets(): Map<string, Bucket> {
  if (!globalBuckets.__aiDoorRateBuckets) {
    globalBuckets.__aiDoorRateBuckets = new Map();
  }
  return globalBuckets.__aiDoorRateBuckets;
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') ?? 'local';
}

export interface RateVerdict {
  allowed: boolean;
  /** Seconds until the window resets. Only meaningful when blocked. */
  retryAfter: number;
}

export function checkRate(key: string, limit: number): RateVerdict {
  const now = Date.now();
  const store = buckets();

  // Opportunistic sweep: without it a long-running instance holds one entry
  // per address that ever called.
  if (store.size > 5_000) {
    for (const [id, bucket] of store) {
      if (bucket.resetAt <= now) store.delete(id);
    }
  }

  const existing = store.get(key);
  if (!existing || existing.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfter: 0 };
}

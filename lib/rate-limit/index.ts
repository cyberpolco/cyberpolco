import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Rate limiter keyed by IP + route.
 *
 * Uses Upstash Redis when UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN
 * are configured, so the limit holds across Vercel's separate serverless
 * instances/regions. Falls back to an in-memory counter otherwise, so local
 * dev works with zero setup — that fallback does NOT hold a consistent
 * limit in production, since each instance keeps its own counter.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// One Ratelimit instance per distinct (limit, windowMs) pair — the Upstash
// client bakes the limit/window into the instance rather than taking them
// per call, so callers that pass custom values each get their own instance.
const redisLimiters = new Map<string, Ratelimit>();

function getRedisLimiter(limit: number, windowMs: number): Ratelimit {
  const cacheKey = `${limit}:${windowMs}`;
  let limiter = redisLimiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
    });
    redisLimiters.set(cacheKey, limiter);
  }
  return limiter;
}

export async function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): Promise<{ success: boolean; remaining: number }> {
  if (redis) {
    const { success, remaining } = await getRedisLimiter(limit, windowMs).limit(key);
    return { success, remaining };
  }

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0 };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count };
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

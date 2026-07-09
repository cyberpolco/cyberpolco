/**
 * Minimal in-memory rate limiter, keyed by IP + route.
 *
 * PRODUCTION NOTE: in-memory state doesn't survive across serverless
 * invocations or multiple regions on Vercel. Before going live, swap this
 * for Upstash Redis (see README.md → "Upgrading rate limiting"). The
 * `checkRateLimit` signature below is designed to map 1:1 onto
 * `@upstash/ratelimit`'s `.limit()` call, so callers won't need to change.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(
  key: string,
  limit = 5,
  windowMs = 60_000
): { success: boolean; remaining: number } {
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

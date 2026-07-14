import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, getClientIp } from "./index";

// No UPSTASH_REDIS_REST_URL/TOKEN in the test env, so checkRateLimit always
// exercises the in-memory fallback path here.

describe("checkRateLimit (in-memory fallback)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests up to the limit, then blocks", async () => {
    const key = `test:${Math.random()}`;

    for (let i = 0; i < 3; i++) {
      const result = await checkRateLimit(key, 3, 60_000);
      expect(result.success).toBe(true);
    }

    const blocked = await checkRateLimit(key, 3, 60_000);
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets the count once the window passes", async () => {
    const key = `test:${Math.random()}`;

    await checkRateLimit(key, 1, 60_000);
    expect((await checkRateLimit(key, 1, 60_000)).success).toBe(false);

    vi.setSystemTime(60_001);

    expect((await checkRateLimit(key, 1, 60_000)).success).toBe(true);
  });

  it("tracks separate keys independently", async () => {
    const keyA = `test:a:${Math.random()}`;
    const keyB = `test:b:${Math.random()}`;

    await checkRateLimit(keyA, 1, 60_000);
    expect((await checkRateLimit(keyA, 1, 60_000)).success).toBe(false);
    expect((await checkRateLimit(keyB, 1, 60_000)).success).toBe(true);
  });
});

describe("getClientIp", () => {
  it("prefers the first x-forwarded-for entry", () => {
    const headers = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(headers)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(getClientIp(headers)).toBe("9.9.9.9");
  });

  it("falls back to 'unknown' with no IP headers", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});

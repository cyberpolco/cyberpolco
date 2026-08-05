import { describe, expect, it } from "vitest";
import { computeMbps, createRollingThroughput, generateRandomPayload } from "./index";

describe("computeMbps", () => {
  it("computes megabits per second from bytes and seconds", () => {
    // 1,000,000 bytes in 1 second = 8,000,000 bits/s = 8 Mbps.
    expect(computeMbps(1_000_000, 1)).toBe(8);
  });

  it("rounds to one decimal place", () => {
    expect(computeMbps(1_250_000, 1)).toBe(10);
  });

  it("returns 0 for zero or negative seconds", () => {
    expect(computeMbps(1_000_000, 0)).toBe(0);
    expect(computeMbps(1_000_000, -1)).toBe(0);
  });

  it("returns 0 for zero bytes", () => {
    expect(computeMbps(0, 1)).toBe(0);
  });
});

describe("createRollingThroughput", () => {
  it("returns 0 on the first sample (no elapsed time yet)", () => {
    const rolling = createRollingThroughput(1000);
    expect(rolling.record(0, 1_000_000)).toBe(0);
  });

  it("measures throughput over the full span while still inside the window", () => {
    const rolling = createRollingThroughput(1000);
    rolling.record(0, 0);
    // 1,000,000 bytes in 0.5s = 16 Mbps.
    expect(rolling.record(500, 1_000_000)).toBe(16);
  });

  it("drops samples older than the window, reflecting only recent bytes", () => {
    const rolling = createRollingThroughput(1000);
    rolling.record(0, 0);
    rolling.record(500, 1_000_000);
    // By t=2000, the t=0 sample has fallen out of the trailing 1000ms
    // window — only bytes since the oldest in-window sample (t=500,
    // 1,000,000 bytes) count: 1,000,000 bytes in 1.5s ≈ 5.3 Mbps, not the
    // ~13.3 Mbps a since-start average over 2s would report.
    expect(rolling.record(2000, 2_000_000)).toBe(5.3);
  });

  it("reports 0 when throughput stalls (no new bytes within the window)", () => {
    const rolling = createRollingThroughput(1000);
    rolling.record(0, 1_000_000);
    expect(rolling.record(1500, 1_000_000)).toBe(0);
  });
});

describe("generateRandomPayload", () => {
  it("returns a buffer of the requested size", () => {
    expect(generateRandomPayload(10).byteLength).toBe(10);
  });

  it("fills a buffer larger than the 65536-byte getRandomValues chunk limit", () => {
    const size = 200_000;
    const payload = generateRandomPayload(size);
    expect(payload.byteLength).toBe(size);
    // Not all-zero — a real chunked fill happened across the whole buffer,
    // including past the first 65536-byte chunk boundary.
    expect(payload.slice(70_000, 70_010).some((b) => b !== 0)).toBe(true);
    expect(payload.slice(size - 10).some((b) => b !== 0)).toBe(true);
  });

  it("returns an empty buffer for size 0", () => {
    expect(generateRandomPayload(0).byteLength).toBe(0);
  });
});

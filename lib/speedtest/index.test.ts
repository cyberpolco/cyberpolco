import { describe, expect, it } from "vitest";
import {
  computeMbps,
  clampDownloadSize,
  generateRandomPayload,
  MIN_DOWNLOAD_BYTES,
  MAX_DOWNLOAD_BYTES,
  DEFAULT_DOWNLOAD_BYTES,
} from "./index";

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

describe("clampDownloadSize", () => {
  it("defaults when null", () => {
    expect(clampDownloadSize(null)).toBe(DEFAULT_DOWNLOAD_BYTES);
  });

  it("defaults when not finite (NaN)", () => {
    expect(clampDownloadSize(Number.NaN)).toBe(DEFAULT_DOWNLOAD_BYTES);
  });

  it("clamps below the minimum", () => {
    expect(clampDownloadSize(1000)).toBe(MIN_DOWNLOAD_BYTES);
  });

  it("clamps above the maximum", () => {
    expect(clampDownloadSize(999_000_000)).toBe(MAX_DOWNLOAD_BYTES);
  });

  it("passes through an in-range value", () => {
    expect(clampDownloadSize(1_000_000)).toBe(1_000_000);
  });

  it("floors a fractional value", () => {
    expect(clampDownloadSize(1_000_000.7)).toBe(1_000_000);
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

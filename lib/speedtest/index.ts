// Pure helpers shared by the speed-test API routes (server) and
// SpeedTestRunner (client) — framework-agnostic so both bundles can import
// it and it stays unit-testable here in Node.

export const DEFAULT_DOWNLOAD_BYTES = 5_000_000;
export const MIN_DOWNLOAD_BYTES = 256_000;
export const MAX_DOWNLOAD_BYTES = 20_000_000;
export const UPLOAD_BYTES = 3_000_000;
export const MAX_UPLOAD_BYTES = 20_000_000;

// getRandomValues() has a hard 65536-byte-per-call limit in browsers — this
// fills one pre-allocated buffer in chunks instead of concatenating many
// small ones, so a multi-MB upload payload doesn't require special-casing.
const MAX_RANDOM_CHUNK = 65536;

export function computeMbps(bytes: number, seconds: number): number {
  if (seconds <= 0 || bytes <= 0) return 0;
  return Math.round(((bytes * 8) / seconds / 1_000_000) * 10) / 10;
}

export function clampDownloadSize(requested: number | null): number {
  if (requested === null || !Number.isFinite(requested)) return DEFAULT_DOWNLOAD_BYTES;
  return Math.min(Math.max(Math.floor(requested), MIN_DOWNLOAD_BYTES), MAX_DOWNLOAD_BYTES);
}

export function generateRandomPayload(size: number): Uint8Array {
  const data = new Uint8Array(size);
  for (let offset = 0; offset < size; offset += MAX_RANDOM_CHUNK) {
    const end = Math.min(offset + MAX_RANDOM_CHUNK, size);
    globalThis.crypto.getRandomValues(data.subarray(offset, end));
  }
  return data;
}

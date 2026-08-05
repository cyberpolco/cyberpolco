// Pure helpers shared by the speed-test API routes (server) and
// SpeedTestRunner (client) — framework-agnostic so both bundles can import
// it and it stays unit-testable here in Node.

// Each phase runs for a fixed wall-clock budget instead of a fixed byte
// count. A fixed byte count makes the test take proportionally longer the
// slower the link is — exactly backwards for Starlink, where the whole
// point is to diagnose a slow/degraded link quickly. A fixed duration keeps
// total test time predictable regardless of throughput.
export const TEST_DURATION_MS = 5_000;

// The live gauge reports throughput measured only over this trailing
// window, not since the phase started. A since-start average flattens out
// the longer a test runs — which hides exactly the fluctuation (Starlink
// bufferbloat, weather fade, contention) this tool exists to surface.
export const LIVE_WINDOW_MS = 750;

// Upload has no cross-browser way to stream a request body progressively,
// so it's built from repeated chunk uploads instead (see SpeedTestRunner),
// sized adaptively between these bounds from the previous chunk's measured
// rate. A fixed chunk size can't win on both ends: large enough to keep
// request overhead down on a fast link, it badly overshoots TEST_DURATION_MS
// on a slow/degraded one — precisely the Starlink case this test exists for.
export const MIN_UPLOAD_CHUNK_BYTES = 200_000;
export const MAX_UPLOAD_CHUNK_BYTES = 2_000_000;
// Per-request cap enforced by the upload route — comfortably above the
// largest chunk so legitimate uploads never trip it, while still bounding a
// single request's body size.
export const MAX_UPLOAD_BYTES = 3_000_000;

// getRandomValues() has a hard 65536-byte-per-call limit in browsers — this
// fills one pre-allocated buffer in chunks instead of concatenating many
// small ones, so a multi-MB upload payload doesn't require special-casing.
const MAX_RANDOM_CHUNK = 65536;

export function computeMbps(bytes: number, seconds: number): number {
  if (seconds <= 0 || bytes <= 0) return 0;
  return Math.round(((bytes * 8) / seconds / 1_000_000) * 10) / 10;
}

export function generateRandomPayload(size: number): Uint8Array {
  const data = new Uint8Array(size);
  for (let offset = 0; offset < size; offset += MAX_RANDOM_CHUNK) {
    const end = Math.min(offset + MAX_RANDOM_CHUNK, size);
    globalThis.crypto.getRandomValues(data.subarray(offset, end));
  }
  return data;
}

export type RollingThroughput = {
  // Feed it the current time and cumulative byte count for a stream (or the
  // sum across concurrent streams); returns the Mbps measured over just the
  // trailing window, so callers get a live number that actually moves with
  // real fluctuation instead of settling into a flat average.
  record(t: number, totalBytes: number): number;
};

export function createRollingThroughput(windowMs: number = LIVE_WINDOW_MS): RollingThroughput {
  const samples: { t: number; bytes: number }[] = [];
  return {
    record(t: number, totalBytes: number): number {
      samples.push({ t, bytes: totalBytes });
      // Keeps samples[0] as the reference point, only dropping it once a
      // second sample has also aged out of the window — so it always
      // retains one anchor at-or-before the window boundary. Trimming
      // down to just the sample being recorded (dropping everything else
      // whenever samples thin out, e.g. after a stall) would compare the
      // new sample to itself and report 0 even though bytes clearly moved.
      while (samples.length > 2 && t - samples[1].t > windowMs) samples.shift();
      const oldest = samples[0];
      return computeMbps(totalBytes - oldest.bytes, (t - oldest.t) / 1000);
    },
  };
}

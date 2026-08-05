import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth/rbac";
import { checkRateLimit } from "@/lib/rate-limit";

// Node runtime (not edge) so node:crypto's randomBytes is available with no
// per-call size limit, unlike the Web Crypto getRandomValues used client-side.
export const runtime = "nodejs";

const CHUNK_BYTES = 65536;
// Defense-in-depth only: the client aborts each stream after
// TEST_DURATION_MS (see SpeedTestRunner) regardless of measured throughput,
// so this should never be reached in normal operation — it just bounds how
// much a single stream can generate if an abort is ever missed.
const MAX_STREAM_BYTES = 1_000_000_000;

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // A full test hits this 3x concurrently (see SpeedTestRunner) — 12/min
  // allows 2 full runs per minute rather than exhausting the budget on a
  // single one.
  const rate = await checkRateLimit(`speedtest:download:${session.userId}`, 12, 60_000);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  let sent = 0;
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (req.signal.aborted || sent >= MAX_STREAM_BYTES) {
        controller.close();
        return;
      }
      // Genuinely random bytes, not zeros/a repeating pattern — a CDN/proxy
      // could otherwise gzip-compress a compressible payload in transit,
      // shrinking the actual bytes transferred and skewing measured Mbps
      // upward.
      const size = Math.min(CHUNK_BYTES, MAX_STREAM_BYTES - sent);
      const chunk = crypto.randomBytes(size);
      sent += chunk.length;
      controller.enqueue(chunk);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Cache-Control": "no-store",
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { clampDownloadSize } from "@/lib/speedtest";

// Node runtime (not edge) so node:crypto's randomBytes is available with no
// per-call size limit, unlike the Web Crypto getRandomValues used client-side.
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rate = await checkRateLimit(`speedtest:download:${session.userId}`, 6, 60_000);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  const requested = req.nextUrl.searchParams.get("size");
  const size = clampDownloadSize(requested === null ? null : Number(requested));
  // Genuinely random bytes, not zeros/a repeating pattern — a CDN/proxy could
  // otherwise gzip-compress a compressible payload in transit, shrinking the
  // actual bytes transferred and skewing the measured Mbps upward.
  const buffer = crypto.randomBytes(size);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(size),
      "Cache-Control": "no-store",
    },
  });
}

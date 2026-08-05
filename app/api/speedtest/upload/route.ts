import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { MAX_UPLOAD_BYTES } from "@/lib/speedtest";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Unlike download, a single upload "stream" is actually a loop of repeated
  // chunk requests (see measureUploadOnce in SpeedTestRunner) since browsers
  // can't stream a request body progressively across the board. 3 concurrent
  // streams, each firing off chunks for the whole TEST_DURATION_MS window,
  // can mean dozens of requests per run, so this needs much more headroom
  // than download's 3-requests-total.
  const rate = await checkRateLimit(`speedtest:upload:${session.userId}`, 200, 60_000);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests. Please wait a minute." }, { status: 429 });
  }

  const declaredLength = Number(req.headers.get("content-length") || 0);
  if (declaredLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  const body = await req.arrayBuffer();
  if (body.byteLength > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "Payload too large" }, { status: 413 });
  }

  return NextResponse.json({ bytesReceived: body.byteLength });
}

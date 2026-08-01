import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/rbac";
import { checkRateLimit } from "@/lib/rate-limit";
import { MAX_UPLOAD_BYTES } from "@/lib/speedtest";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // A full test runs this 3x (see SpeedTestRunner) — 12/min allows 2 full
  // runs per minute rather than exhausting the budget on a single one.
  const rate = await checkRateLimit(`speedtest:upload:${session.userId}`, 12, 60_000);
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

import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/rbac";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rate = await checkRateLimit(`speedtest:ping:${session.userId}`, 30, 60_000);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  return new NextResponse(null, { status: 204 });
}

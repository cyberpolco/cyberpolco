import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth/rbac";
import { getUsers, saveUser } from "@/lib/db/users";

/**
 * Resets the login password for whichever user account has `linkedId`
 * matching the given Starlink client / Academy enrollment. Distinct from
 * a Starlink site's wifiPassword (network config, admin-revealable) — this
 * is the actual dashboard login credential, so the generated password is
 * only ever returned once in this JSON response, never persisted or logged.
 */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const linkedId = body?.linkedId;
  if (!linkedId || typeof linkedId !== "string") {
    return NextResponse.json({ error: "Missing linkedId" }, { status: 400 });
  }

  const users = await getUsers();
  const user = users.find((u) => u.linkedId === linkedId);
  if (!user) {
    return NextResponse.json({ error: "No account is linked to this record." }, { status: 404 });
  }

  const password = crypto.randomBytes(9).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 10);
  await saveUser({ ...user, passwordHash, mustChangePassword: true });

  return NextResponse.json({ password });
}

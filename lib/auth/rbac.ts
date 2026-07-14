import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE_NAME, verifySessionToken, type SessionPayload } from "./session";
import type { Role } from "./roles";

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const result = verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  if (!result.valid) return null;
  return {
    userId: result.userId,
    email: result.email,
    role: result.role,
    mustChangePassword: result.mustChangePassword,
    viewerType: result.viewerType,
    linkedId: result.linkedId,
  };
}

/**
 * Defense-in-depth for Server Components/Actions — proxy.ts already gates
 * routes by role, but a Server Action reference can still be invoked
 * directly, so mutating actions should call this too, not rely on the
 * route guard alone.
 */
export async function requireRole(allowed: Role[]): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) redirect("/admin/login");
  if (!allowed.includes(session.role)) redirect("/admin/dashboard");
  return session;
}

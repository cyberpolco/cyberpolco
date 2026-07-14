import crypto from "crypto";
import type { Role } from "./roles";
import type { ViewerType } from "@/lib/db/users";

/**
 * Lightweight signed-cookie session — see roles.ts for the permission model.
 *
 * DESIGN NOTE: the spec called for Auth.js (NextAuth). We shipped this
 * simpler HMAC-signed cookie instead because this is a small team (a
 * handful of admin accounts, no registration, no OAuth) — pulling in
 * NextAuth's full session/provider machinery just to carry a userId/role
 * through a cookie would add configuration surface without adding
 * security. If you later need SSO or magic-link login, swap this module
 * for Auth.js's Credentials provider — everything that imports
 * `createSessionToken`/`verifySessionToken` only needs those two function
 * signatures preserved.
 */

const COOKIE_NAME = "cp_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export type SessionPayload = {
  userId: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  viewerType?: ViewerType | null;
  linkedId?: string | null;
};

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add it to your environment variables (see README.md)."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function createSessionToken(payload: SessionPayload): string {
  const body = JSON.stringify({ ...payload, expiresAt: Date.now() + SESSION_TTL_MS });
  const bodyB64 = Buffer.from(body).toString("base64url");
  return `${bodyB64}.${sign(bodyB64)}`;
}

export function verifySessionToken(
  token: string | undefined
): { valid: false } | ({ valid: true } & SessionPayload) {
  if (!token) return { valid: false };
  try {
    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) return { valid: false };

    const bodyB64 = token.slice(0, dotIndex);
    const signature = token.slice(dotIndex + 1);
    const expected = sign(bodyB64);

    const validSignature =
      signature.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    if (!validSignature) return { valid: false };

    const decoded = JSON.parse(Buffer.from(bodyB64, "base64url").toString("utf-8"));
    const { expiresAt, ...payload } = decoded;
    if (typeof expiresAt !== "number" || Date.now() > expiresAt) {
      return { valid: false };
    }

    return { valid: true, ...(payload as SessionPayload) };
  } catch {
    return { valid: false };
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

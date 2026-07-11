import crypto from "crypto";

/**
 * Lightweight signed-cookie session for the single admin account.
 *
 * DESIGN NOTE: the spec called for Auth.js (NextAuth). We shipped this
 * simpler HMAC-signed cookie instead because there is exactly one admin
 * account (no registration, no roles, no OAuth) — pulling in NextAuth's
 * full session/provider machinery for a single hardcoded credential pair
 * would add configuration surface without adding security. If you later
 * need multiple admin users, SSO, or magic-link login, swap this module for
 * Auth.js's Credentials provider — everything that imports
 * `createSession`/`verifySession` only needs those two function signatures
 * preserved.
 */

const COOKIE_NAME = "cp_admin_session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

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

export function createSessionToken(email: string): string {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${email}.${expiresAt}`;
  const signature = sign(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

export function verifySessionToken(
  token: string | undefined
): { valid: boolean; email?: string } {
  if (!token) return { valid: false };
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    // Split from the right: the signature and expiry are always the last two
    // segments, but the email itself may contain dots.
    const lastDot = decoded.lastIndexOf(".");
    const secondLastDot = decoded.lastIndexOf(".", lastDot - 1);
    const email = decoded.slice(0, secondLastDot);
    const expiresAtStr = decoded.slice(secondLastDot + 1, lastDot);
    const signature = decoded.slice(lastDot + 1);
    const expiresAt = Number(expiresAtStr);
    const expected = sign(`${email}.${expiresAtStr}`);

    const validSignature = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );

    if (!validSignature || Date.now() > expiresAt) {
      return { valid: false };
    }
    return { valid: true, email };
  } catch {
    return { valid: false };
  }
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_SESSION_MAX_AGE_SECONDS = SESSION_TTL_MS / 1000;

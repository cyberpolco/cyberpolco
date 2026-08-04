import crypto from "crypto";
import type { NextRequest } from "next/server";

/**
 * PawaPay callback authenticity check.
 *
 * TODO(confirm against PawaPay's docs once the API token/dashboard exists):
 * PawaPay callbacks are typically authenticated one of two ways:
 *   (a) A static "Authorization: Bearer <token>" header configured in the
 *       PawaPay dashboard — same shape as CRON_SECRET in
 *       app/api/cron/starlink-subscription-reminders/route.ts.
 *   (b) An HMAC-SHA256 signature over the raw request body in a response
 *       header — same shape as lib/auth/session.ts's cookie signature
 *       (createHmac + timingSafeEqual, never a plain === on secrets).
 * Both are implemented below; PAWAPAY_WEBHOOK_AUTH_MODE picks which one
 * actually runs. Leaving it unset rejects every callback — fail closed.
 */

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function verifyBearerToken(req: NextRequest): boolean {
  const expected = process.env.PAWAPAY_WEBHOOK_SECRET;
  if (!expected) return false;
  const auth = req.headers.get("authorization") ?? "";
  const provided = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return provided.length > 0 && timingSafeStringEqual(provided, expected);
}

function verifyHmacSignature(req: NextRequest, rawBody: string): boolean {
  const secret = process.env.PAWAPAY_WEBHOOK_SECRET;
  // Header name is a placeholder — confirm PawaPay's actual header once
  // docs are in hand (candidates seen across similar mobile-money gateways:
  // "Signature", "X-PawaPay-Signature").
  const signatureHeader = req.headers.get("x-pawapay-signature") ?? req.headers.get("signature");
  if (!secret || !signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  return timingSafeStringEqual(signatureHeader, expected);
}

export function verifyPawaPayCallback(req: NextRequest, rawBody: string): boolean {
  const mode = process.env.PAWAPAY_WEBHOOK_AUTH_MODE;
  if (mode === "bearer") return verifyBearerToken(req);
  if (mode === "hmac") return verifyHmacSignature(req, rawBody);
  return false;
}

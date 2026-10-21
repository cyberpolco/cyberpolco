import crypto from "crypto";
import type { NextRequest } from "next/server";
import { httpbis, type VerifyingKey } from "http-message-signatures";
import { getPawaPayPublicKeys, type PawaPayPublicKey } from "./client";

/**
 * PawaPay callback authenticity check.
 *
 * PawaPay signs callbacks with RFC-9421 HTTP message signatures (enabled per
 * account via the dashboard's "signed callbacks" toggle) — there is no
 * shared bearer token or HMAC secret. See
 * https://docs.pawapay.io/v2/docs/signatures. Verification:
 *   1. Content-Digest (sha-256 or sha-512) must match the raw body.
 *   2. Signature/Signature-Input must verify against one of PawaPay's public
 *      keys from GET /v2/public-key/http, and cover the digest.
 * Any failure (unsigned callback, unreachable key endpoint) rejects — fail
 * closed. Deposits still settle via the status-poll fallback.
 */

const KEY_CACHE_TTL_MS = 60 * 60 * 1000;
// Floor on refetching after a verification miss, so a stream of forged
// callbacks can't turn into a stream of public-key requests.
const KEY_REFRESH_MIN_INTERVAL_MS = 5 * 60 * 1000;
// PawaPay's example signatures expire 60s after creation; allow some skew.
const CLOCK_TOLERANCE_SECONDS = 30;

let cachedKeys: { keys: PawaPayPublicKey[]; fetchedAt: number } | null = null;

async function loadPublicKeys(forceRefresh: boolean): Promise<PawaPayPublicKey[]> {
  if (!forceRefresh && cachedKeys && Date.now() - cachedKeys.fetchedAt < KEY_CACHE_TTL_MS) {
    return cachedKeys.keys;
  }
  const keys = await getPawaPayPublicKeys();
  cachedKeys = { keys, fetchedAt: Date.now() };
  return keys;
}

// Test-only: drops the module-level key cache between cases.
export function resetPublicKeyCache() {
  cachedKeys = null;
}

function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

const DIGEST_ALGORITHMS: Record<string, string> = { "sha-256": "sha256", "sha-512": "sha512" };

function verifyContentDigest(header: string | null, rawBody: string): boolean {
  const match = header?.match(/^(sha-256|sha-512)=:([A-Za-z0-9+/=]+):$/);
  if (!match) return false;
  const expected = crypto.createHash(DIGEST_ALGORITHMS[match[1]]).update(rawBody).digest("base64");
  return timingSafeStringEqual(match[2], expected);
}

function toVerifyingKey(publicKey: PawaPayPublicKey): VerifyingKey {
  const keyObject = crypto.createPublicKey(publicKey.key);
  return {
    id: publicKey.id,
    async verify(data, signature, params) {
      const alg = params?.alg;
      if (alg === "ecdsa-p256-sha256") return crypto.verify("sha256", data, keyObject, signature);
      if (alg === "ecdsa-p384-sha384") return crypto.verify("sha384", data, keyObject, signature);
      if (alg === "rsa-v1_5-sha256") return crypto.verify("sha256", data, keyObject, signature);
      if (alg === "rsa-pss-sha512") {
        return crypto.verify(
          "sha512",
          data,
          { key: keyObject, padding: crypto.constants.RSA_PKCS1_PSS_PADDING, saltLength: 64 },
          signature
        );
      }
      return false;
    },
  };
}

async function verifyWithKeys(req: NextRequest, keys: PawaPayPublicKey[]): Promise<boolean> {
  // @authority must be the host PawaPay called, not Vercel's internal URL.
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? req.nextUrl.host;
  const url = `https://${host}${req.nextUrl.pathname}${req.nextUrl.search}`;
  const headers = Object.fromEntries(req.headers.entries());

  // The callback's keyid doesn't necessarily match the public-key id, so
  // try every currently published key.
  for (const publicKey of keys) {
    const key = toVerifyingKey(publicKey);
    try {
      const ok = await httpbis.verifyMessage(
        {
          keyLookup: async () => key,
          requiredFields: ["content-digest"],
          tolerance: CLOCK_TOLERANCE_SECONDS,
        },
        { method: req.method, url, headers }
      );
      if (ok) return true;
    } catch {
      // Malformed or expired signature for this key — try the next one.
    }
  }
  return false;
}

export async function verifyPawaPayCallback(req: NextRequest, rawBody: string): Promise<boolean> {
  if (!req.headers.get("signature") || !req.headers.get("signature-input")) return false;
  if (!verifyContentDigest(req.headers.get("content-digest"), rawBody)) return false;

  try {
    if (await verifyWithKeys(req, await loadPublicKeys(false))) return true;
    // PawaPay may have rotated keys since they were cached.
    if (!cachedKeys || Date.now() - cachedKeys.fetchedAt < KEY_REFRESH_MIN_INTERVAL_MS) return false;
    return await verifyWithKeys(req, await loadPublicKeys(true));
  } catch (err) {
    console.error("PawaPay callback verification failed:", err);
    return false;
  }
}

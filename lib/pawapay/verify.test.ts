import { beforeEach, describe, expect, it, vi } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { httpbis } from "http-message-signatures";

vi.mock("./client", () => ({ getPawaPayPublicKeys: vi.fn() }));

const { getPawaPayPublicKeys } = await import("./client");
const { verifyPawaPayCallback, resetPublicKeyCache } = await import("./verify");

const CALLBACK_URL = "https://www.cyberpolco.com/api/pawapay/deposits/callback";

const pawapayKeys = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });
const otherKeys = crypto.generateKeyPairSync("ec", { namedCurve: "prime256v1" });

function publicPem(keys: crypto.KeyPairKeyObjectResult) {
  return keys.publicKey.export({ type: "spki", format: "pem" }).toString();
}

function digest(body: string) {
  return `sha-512=:${crypto.createHash("sha512").update(body).digest("base64")}:`;
}

// Mirrors PawaPay's documented callback: sig-pp over method, authority,
// path, signature-date, content-digest and content-type.
async function signedRequest(
  body: string,
  { signingKeys = pawapayKeys, contentDigest = digest(body), created = new Date() } = {}
) {
  const headers: Record<string, string> = {
    "content-type": "application/json; charset=UTF-8",
    "content-digest": contentDigest,
    "signature-date": created.toISOString(),
    host: "www.cyberpolco.com",
  };
  const signed = await httpbis.signMessage(
    {
      key: {
        id: "CUSTOMER_TEST_KEY",
        alg: "ecdsa-p256-sha256",
        sign: async (data: Buffer) => crypto.sign("sha256", data, signingKeys.privateKey),
      },
      name: "sig-pp",
      fields: ["@method", "@authority", "@path", "signature-date", "content-digest", "content-type"],
      params: ["created", "expires", "keyid", "alg"],
      paramValues: { created, expires: new Date(created.getTime() + 60_000) },
    },
    { method: "POST", url: CALLBACK_URL, headers }
  );
  return new NextRequest(CALLBACK_URL, {
    method: "POST",
    headers: signed.headers as Record<string, string>,
    body,
  });
}

describe("verifyPawaPayCallback", () => {
  const body = '{"depositId":"dep-1","status":"COMPLETED"}';

  beforeEach(() => {
    vi.clearAllMocks();
    resetPublicKeyCache();
    vi.mocked(getPawaPayPublicKeys).mockResolvedValue([{ id: "HTTP_EC_P256_KEY:1", key: publicPem(pawapayKeys) }]);
  });

  it("accepts a callback signed with PawaPay's published key", async () => {
    expect(await verifyPawaPayCallback(await signedRequest(body), body)).toBe(true);
  });

  it("rejects an unsigned callback without fetching keys", async () => {
    const req = new NextRequest(CALLBACK_URL, { method: "POST", headers: { "content-digest": digest(body) }, body });
    expect(await verifyPawaPayCallback(req, body)).toBe(false);
    expect(getPawaPayPublicKeys).not.toHaveBeenCalled();
  });

  it("rejects a body that doesn't match Content-Digest", async () => {
    const req = await signedRequest(body);
    expect(await verifyPawaPayCallback(req, '{"depositId":"dep-1","status":"FAILED"}')).toBe(false);
  });

  it("rejects a signature from a key PawaPay didn't publish", async () => {
    expect(await verifyPawaPayCallback(await signedRequest(body, { signingKeys: otherKeys }), body)).toBe(false);
  });

  it("rejects an expired signature", async () => {
    const req = await signedRequest(body, { created: new Date(Date.now() - 10 * 60_000) });
    expect(await verifyPawaPayCallback(req, body)).toBe(false);
  });

  it("fails closed when the public keys can't be fetched", async () => {
    vi.mocked(getPawaPayPublicKeys).mockRejectedValue(new Error("network down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await verifyPawaPayCallback(await signedRequest(body), body)).toBe(false);
  });

  it("caches the public keys between callbacks", async () => {
    await verifyPawaPayCallback(await signedRequest(body), body);
    await verifyPawaPayCallback(await signedRequest(body), body);
    expect(getPawaPayPublicKeys).toHaveBeenCalledTimes(1);
  });
});

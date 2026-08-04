import { afterEach, beforeEach, describe, expect, it } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { verifyPawaPayCallback } from "./verify";

const ORIGINAL_ENV = { ...process.env };

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/pawapay/deposits/callback", {
    method: "POST",
    headers,
    body: "{}",
  });
}

describe("verifyPawaPayCallback", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("fails closed when PAWAPAY_WEBHOOK_AUTH_MODE is unset", () => {
    delete process.env.PAWAPAY_WEBHOOK_AUTH_MODE;
    delete process.env.PAWAPAY_WEBHOOK_SECRET;
    expect(verifyPawaPayCallback(makeRequest(), "{}")).toBe(false);
  });

  describe("bearer mode", () => {
    beforeEach(() => {
      process.env.PAWAPAY_WEBHOOK_AUTH_MODE = "bearer";
      process.env.PAWAPAY_WEBHOOK_SECRET = "test-secret";
    });

    it("accepts a matching bearer token", () => {
      const req = makeRequest({ authorization: "Bearer test-secret" });
      expect(verifyPawaPayCallback(req, "{}")).toBe(true);
    });

    it("rejects a mismatched bearer token", () => {
      const req = makeRequest({ authorization: "Bearer wrong" });
      expect(verifyPawaPayCallback(req, "{}")).toBe(false);
    });

    it("rejects a missing authorization header", () => {
      expect(verifyPawaPayCallback(makeRequest(), "{}")).toBe(false);
    });
  });

  describe("hmac mode", () => {
    beforeEach(() => {
      process.env.PAWAPAY_WEBHOOK_AUTH_MODE = "hmac";
      process.env.PAWAPAY_WEBHOOK_SECRET = "test-secret";
    });

    it("accepts a valid HMAC signature over the raw body", () => {
      const rawBody = '{"depositId":"dep-1"}';
      const signature = crypto.createHmac("sha256", "test-secret").update(rawBody).digest("hex");
      const req = makeRequest({ "x-pawapay-signature": signature });
      expect(verifyPawaPayCallback(req, rawBody)).toBe(true);
    });

    it("rejects a mismatched signature", () => {
      const req = makeRequest({ "x-pawapay-signature": "deadbeef" });
      expect(verifyPawaPayCallback(req, "{}")).toBe(false);
    });

    it("rejects a missing signature header", () => {
      expect(verifyPawaPayCallback(makeRequest(), "{}")).toBe(false);
    });
  });
});

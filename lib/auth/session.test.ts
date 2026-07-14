import { beforeAll, describe, expect, it } from "vitest";
import crypto from "node:crypto";

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = "test-secret-do-not-use-in-production";
});

const { createSessionToken, verifySessionToken } = await import("./session");

const basePayload = {
  userId: "user-1",
  email: "admin@example.com",
  role: "super_admin" as const,
  mustChangePassword: false,
};

describe("session tokens", () => {
  it("round-trips a valid token", () => {
    const token = createSessionToken(basePayload);
    const result = verifySessionToken(token);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.userId).toBe(basePayload.userId);
      expect(result.email).toBe(basePayload.email);
      expect(result.role).toBe(basePayload.role);
    }
  });

  it("rejects a missing token", () => {
    expect(verifySessionToken(undefined).valid).toBe(false);
  });

  it("rejects a malformed token", () => {
    expect(verifySessionToken("not-a-real-token").valid).toBe(false);
    expect(verifySessionToken("").valid).toBe(false);
  });

  it("rejects a token with a tampered signature", () => {
    const token = createSessionToken(basePayload);
    const [body] = token.split(".");
    const tampered = `${body}.${"0".repeat(64)}`;

    expect(verifySessionToken(tampered).valid).toBe(false);
  });

  it("rejects a token with a tampered payload (role escalation attempt)", () => {
    const token = createSessionToken({ ...basePayload, role: "viewer" });
    const [body, signature] = token.split(".");
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    const escalated = { ...decoded, role: "super_admin" };
    const tamperedBody = Buffer.from(JSON.stringify(escalated)).toString("base64url");

    // Re-attach the ORIGINAL signature, which was computed over the
    // original body — it must not validate against the modified body.
    expect(verifySessionToken(`${tamperedBody}.${signature}`).valid).toBe(false);
  });

  it("rejects an expired token", () => {
    const token = createSessionToken(basePayload);
    const [body] = token.split(".");
    const decoded = JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
    const expired = { ...decoded, expiresAt: Date.now() - 1000 };

    // Re-sign with the real secret so only expiry (not the signature) is under test.
    const expiredBody = Buffer.from(JSON.stringify(expired)).toString("base64url");
    const signature = crypto
      .createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
      .update(expiredBody)
      .digest("hex");

    expect(verifySessionToken(`${expiredBody}.${signature}`).valid).toBe(false);
  });
});

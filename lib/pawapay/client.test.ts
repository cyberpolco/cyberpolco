import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkDepositStatus, initiateDeposit, predictProvider } from "./client";

const ORIGINAL_ENV = { ...process.env };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

describe("pawapay client", () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV, PAWAPAY_API_KEY: "test-key" };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.unstubAllGlobals();
  });

  describe("initiateDeposit", () => {
    const input = {
      depositId: "f4401bd2-1568-4140-bf2d-eb77d2b2b639",
      phoneNumber: "260763456789",
      provider: "MTN_MOMO_ZMB",
      amount: "15",
      currency: "ZMW",
    };

    it("throws if PAWAPAY_API_KEY is not set", async () => {
      delete process.env.PAWAPAY_API_KEY;
      await expect(initiateDeposit(input)).rejects.toThrow(/PAWAPAY_API_KEY is not set/);
    });

    it("posts to the sandbox base URL with a bearer token by default", async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ depositId: input.depositId, status: "ACCEPTED" }));
      vi.stubGlobal("fetch", fetchMock);

      await initiateDeposit(input);

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.sandbox.pawapay.io/v2/deposits");
      expect(options.method).toBe("POST");
      expect(options.headers.Authorization).toBe("Bearer test-key");
      expect(JSON.parse(options.body)).toEqual({
        depositId: input.depositId,
        payer: { type: "MMO", accountDetails: { phoneNumber: input.phoneNumber, provider: input.provider } },
        amount: input.amount,
        currency: input.currency,
      });
    });

    it("uses PAWAPAY_BASE_URL when set", async () => {
      process.env.PAWAPAY_BASE_URL = "https://api.pawapay.io";
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ depositId: input.depositId, status: "ACCEPTED" }));
      vi.stubGlobal("fetch", fetchMock);

      await initiateDeposit(input);

      expect(fetchMock.mock.calls[0][0]).toBe("https://api.pawapay.io/v2/deposits");
    });

    it("returns ACCEPTED with the created timestamp", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(jsonResponse({ depositId: input.depositId, status: "ACCEPTED", created: "2020-10-19T11:17:01Z" }))
      );
      const result = await initiateDeposit(input);
      expect(result).toEqual({ status: "ACCEPTED", depositId: input.depositId, created: "2020-10-19T11:17:01Z" });
    });

    it("returns REJECTED with the failure reason", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          jsonResponse({
            depositId: input.depositId,
            status: "REJECTED",
            failureReason: { failureCode: "INVALID_PHONE_NUMBER", failureMessage: "Phone number invalid" },
          })
        )
      );
      const result = await initiateDeposit(input);
      expect(result).toEqual({
        status: "REJECTED",
        depositId: input.depositId,
        failureReason: { failureCode: "INVALID_PHONE_NUMBER", failureMessage: "Phone number invalid" },
      });
    });

    it("throws on a non-2xx HTTP response", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("server error", { status: 500 })));
      await expect(initiateDeposit(input)).rejects.toThrow(/HTTP 500/);
    });

    it("throws when the response doesn't match the expected shape", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ unexpected: true })));
      await expect(initiateDeposit(input)).rejects.toThrow(/unexpected response shape/);
    });

    it("omits Signature headers when signing keys aren't configured", async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ depositId: input.depositId, status: "ACCEPTED" }));
      vi.stubGlobal("fetch", fetchMock);

      await initiateDeposit(input);

      const [, options] = fetchMock.mock.calls[0];
      expect(options.headers.Signature).toBeUndefined();
      expect(options.headers["Signature-Input"]).toBeUndefined();
      expect(options.headers["Content-Digest"]).toMatch(/^sha-512=:.+:$/);
    });

    it("adds RFC-9421 Signature headers when signing keys are configured", async () => {
      process.env.PAWAPAY_SIGNING_KEY_ID = "test-signing-key";
      process.env.PAWAPAY_SIGNING_PRIVATE_KEY =
        "-----BEGIN EC PRIVATE KEY-----\n" +
        "MHcCAQEEIJgYjijbeBpAk5YxxeDiU/Cn40y+TUGrI6WUFlvsVSHqoAoGCCqGSM49\n" +
        "AwEHoUQDQgAEACPTgeqMouN1XXO0eIFUsE34QD7xpnmP88x4LNwxEw1Dj4j4VmUl\n" +
        "Z4Sryn7p4n4V0A0ZDiCIAkyKbJXh5b0Mfg==\n" +
        "-----END EC PRIVATE KEY-----\n";
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ depositId: input.depositId, status: "ACCEPTED" }));
      vi.stubGlobal("fetch", fetchMock);

      await initiateDeposit(input);

      const [, options] = fetchMock.mock.calls[0];
      expect(options.headers.Signature).toMatch(/^sig-pp=:.+:$/);
      expect(options.headers["Signature-Input"]).toContain('keyid="test-signing-key"');
      expect(options.headers["Signature-Input"]).toContain('alg="ecdsa-p256-sha256"');
    });
  });

  describe("checkDepositStatus", () => {
    const depositId = "8917c345-4791-4285-a416-62f24b6982db";

    it("requests the deposit by id via GET", async () => {
      const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ status: "NOT_FOUND" }));
      vi.stubGlobal("fetch", fetchMock);

      await checkDepositStatus(depositId);

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe(`https://api.sandbox.pawapay.io/v2/deposits/${depositId}`);
      expect(options.method).toBe("GET");
      expect(options.headers.Authorization).toBe("Bearer test-key");
    });

    it("returns found: false for NOT_FOUND", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ status: "NOT_FOUND" })));
      const result = await checkDepositStatus(depositId);
      expect(result).toEqual({ found: false });
    });

    it("returns the deposit for a COMPLETED status", async () => {
      const deposit = {
        depositId,
        status: "COMPLETED",
        amount: "123.00",
        currency: "ZMW",
        country: "ZMB",
        payer: { type: "MMO", accountDetails: { phoneNumber: "260763456789", provider: "MTN_MOMO_ZMB" } },
        providerTransactionId: "12356789",
        created: "2020-10-19T08:17:01Z",
      };
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ status: "FOUND", data: deposit })));
      const result = await checkDepositStatus(depositId);
      expect(result).toEqual({ found: true, deposit });
    });

    it("returns a FAILED deposit with its failure reason", async () => {
      const deposit = {
        depositId,
        status: "FAILED",
        amount: "123.00",
        currency: "ZMW",
        failureReason: { failureCode: "PAYMENT_NOT_APPROVED", failureMessage: "Customer did not approve" },
      };
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ status: "FOUND", data: deposit })));
      const result = await checkDepositStatus(depositId);
      expect(result).toEqual({ found: true, deposit });
    });

    it("throws on a non-2xx HTTP response", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("unauthorized", { status: 401 })));
      await expect(checkDepositStatus(depositId)).rejects.toThrow(/HTTP 401/);
    });
  });

  describe("predictProvider", () => {
    it("posts the raw phone number and returns the sanitized prediction", async () => {
      const fetchMock = vi.fn().mockResolvedValue(
        jsonResponse({ country: "COD", provider: "AIRTEL_COD", phoneNumber: "243973456789" })
      );
      vi.stubGlobal("fetch", fetchMock);

      const result = await predictProvider("+243 973 456 789");

      const [url, options] = fetchMock.mock.calls[0];
      expect(url).toBe("https://api.sandbox.pawapay.io/v2/predict-provider");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({ phoneNumber: "+243 973 456 789" });
      expect(result).toEqual({ country: "COD", provider: "AIRTEL_COD", phoneNumber: "243973456789" });
    });

    it("throws on a non-2xx HTTP response", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("bad number", { status: 400 })));
      await expect(predictProvider("garbage")).rejects.toThrow(/HTTP 400/);
    });

    it("throws when the response doesn't match the expected shape", async () => {
      vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({ unexpected: true })));
      await expect(predictProvider("+243973456789")).rejects.toThrow(/unexpected response shape/);
    });
  });
});

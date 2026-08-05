import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/pawapay/verify", () => ({ verifyPawaPayCallback: vi.fn() }));
vi.mock("@/lib/db/payments", () => ({
  upsertPawaPayTransaction: vi.fn(),
  getPawaPayTransactionByPawaPayId: vi.fn(),
}));
vi.mock("@/lib/pawapay/reconcile", () => ({ applyDepositOutcome: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(), getClientIp: vi.fn(() => "1.2.3.4") }));

const { verifyPawaPayCallback } = await import("@/lib/pawapay/verify");
const { upsertPawaPayTransaction, getPawaPayTransactionByPawaPayId } = await import("@/lib/db/payments");
const { applyDepositOutcome } = await import("@/lib/pawapay/reconcile");
const { checkRateLimit } = await import("@/lib/rate-limit");
const { POST } = await import("./route");

const validPayload = {
  depositId: "dep-123",
  status: "COMPLETED",
  amount: "10.00",
  currency: "ZMW",
  payer: { type: "MMO", accountDetails: { phoneNumber: "260763456789", provider: "MTN_MOMO_ZMB" } },
};

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/pawapay/deposits/callback", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer test-secret" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/pawapay/deposits/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyPawaPayCallback).mockReturnValue(true);
    vi.mocked(upsertPawaPayTransaction).mockResolvedValue(undefined);
    vi.mocked(getPawaPayTransactionByPawaPayId).mockResolvedValue(undefined);
    vi.mocked(applyDepositOutcome).mockResolvedValue(undefined);
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 29 });
  });

  it("returns 429 and never checks the signature when rate limited", async () => {
    vi.mocked(checkRateLimit).mockResolvedValue({ success: false, remaining: 0 });
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(429);
    expect(verifyPawaPayCallback).not.toHaveBeenCalled();
    expect(upsertPawaPayTransaction).not.toHaveBeenCalled();
  });

  it("returns 401 and never touches the DB when signature verification fails", async () => {
    vi.mocked(verifyPawaPayCallback).mockReturnValue(false);
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(401);
    expect(upsertPawaPayTransaction).not.toHaveBeenCalled();
  });

  it("upserts the transaction and returns 200 for a valid payload", async () => {
    const res = await POST(makeRequest(validPayload));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json).toEqual({ ok: true });
    expect(upsertPawaPayTransaction).toHaveBeenCalledWith(
      expect.objectContaining({
        pawapayId: "dep-123",
        type: "deposit",
        status: "COMPLETED",
        payerMsisdn: "260763456789",
      })
    );
  });

  it("applies the domain effect using the referenceType/referenceId set at pending-creation time", async () => {
    vi.mocked(getPawaPayTransactionByPawaPayId).mockResolvedValue({
      id: "tx-1",
      pawapayId: "dep-123",
      type: "deposit",
      status: "COMPLETED",
      amount: "10.00",
      currency: "ZMW",
      payerMsisdn: "260763456789",
      referenceType: "starlink_subscription",
      referenceId: "site-1",
      rawPayload: {},
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    });

    const res = await POST(makeRequest(validPayload));

    expect(res.status).toBe(200);
    expect(applyDepositOutcome).toHaveBeenCalledWith("starlink_subscription", "site-1", "COMPLETED");
  });

  it("skips the domain effect when no pending transaction row exists for this id", async () => {
    vi.mocked(getPawaPayTransactionByPawaPayId).mockResolvedValue(undefined);
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(200);
    expect(applyDepositOutcome).not.toHaveBeenCalled();
  });

  it("is idempotent for a duplicate delivery: calling twice still returns 200 each time", async () => {
    await POST(makeRequest(validPayload));
    const res2 = await POST(makeRequest(validPayload));
    expect(res2.status).toBe(200);
    expect(upsertPawaPayTransaction).toHaveBeenCalledTimes(2);
    expect(upsertPawaPayTransaction).toHaveBeenNthCalledWith(2, expect.objectContaining({ pawapayId: "dep-123" }));
  });

  it("returns 400 for a payload missing the required id field", async () => {
    const res = await POST(makeRequest({ status: "COMPLETED" }));
    expect(res.status).toBe(400);
    expect(upsertPawaPayTransaction).not.toHaveBeenCalled();
  });

  it("returns 500 if the DB write fails", async () => {
    vi.mocked(upsertPawaPayTransaction).mockRejectedValue(new Error("db down"));
    const res = await POST(makeRequest(validPayload));
    expect(res.status).toBe(500);
  });
});

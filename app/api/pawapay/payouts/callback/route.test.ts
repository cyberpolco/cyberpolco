import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/pawapay/verify", () => ({ verifyPawaPayCallback: vi.fn() }));
vi.mock("@/lib/db/payments", () => ({ upsertPawaPayTransaction: vi.fn() }));
vi.mock("@/lib/rate-limit", () => ({ checkRateLimit: vi.fn(), getClientIp: vi.fn(() => "1.2.3.4") }));

const { verifyPawaPayCallback } = await import("@/lib/pawapay/verify");
const { upsertPawaPayTransaction } = await import("@/lib/db/payments");
const { checkRateLimit } = await import("@/lib/rate-limit");
const { POST } = await import("./route");

function makeRequest(body: unknown) {
  return new NextRequest("http://localhost/api/pawapay/payouts/callback", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer test-secret" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/pawapay/payouts/callback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(verifyPawaPayCallback).mockReturnValue(true);
    vi.mocked(upsertPawaPayTransaction).mockResolvedValue(undefined);
    vi.mocked(checkRateLimit).mockResolvedValue({ success: true, remaining: 29 });
  });

  it("returns 401 when signature verification fails", async () => {
    vi.mocked(verifyPawaPayCallback).mockReturnValue(false);
    const res = await POST(makeRequest({ payoutId: "pay-1", status: "COMPLETED" }));
    expect(res.status).toBe(401);
  });

  it("upserts a payout-typed transaction and returns 200 for a valid payload", async () => {
    const res = await POST(makeRequest({ payoutId: "pay-1", status: "COMPLETED" }));
    expect(res.status).toBe(200);
    expect(upsertPawaPayTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ pawapayId: "pay-1", type: "payout" })
    );
  });

  it("returns 400 when the required id field is missing", async () => {
    const res = await POST(makeRequest({ status: "COMPLETED" }));
    expect(res.status).toBe(400);
  });
});

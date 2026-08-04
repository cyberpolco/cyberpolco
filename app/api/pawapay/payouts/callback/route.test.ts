import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/pawapay/verify", () => ({ verifyPawaPayCallback: vi.fn() }));
vi.mock("@/lib/db/payments", () => ({ upsertPawaPayTransaction: vi.fn() }));

const { verifyPawaPayCallback } = await import("@/lib/pawapay/verify");
const { upsertPawaPayTransaction } = await import("@/lib/db/payments");
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

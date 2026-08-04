import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/pawapay/verify", () => ({ verifyPawaPayCallback: vi.fn() }));
vi.mock("@/lib/db/payments", () => ({ upsertPawaPayTransaction: vi.fn() }));

const { verifyPawaPayCallback } = await import("@/lib/pawapay/verify");
const { upsertPawaPayTransaction } = await import("@/lib/db/payments");
const { POST } = await import("./route");

const validPayload = { depositId: "dep-123", status: "COMPLETED", amount: "10.00", currency: "ZMW" };

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
      expect.objectContaining({ pawapayId: "dep-123", type: "deposit", status: "COMPLETED" })
    );
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

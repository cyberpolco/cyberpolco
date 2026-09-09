import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/starlink", () => ({ markStarlinkSiteSubscriptionPaid: vi.fn() }));
vi.mock("@/lib/db/academy", () => ({ markEnrollmentFeePaid: vi.fn() }));
vi.mock("@/lib/receipts/generate", () => ({ generateReceiptForDeposit: vi.fn() }));

const { markStarlinkSiteSubscriptionPaid } = await import("@/lib/db/starlink");
const { markEnrollmentFeePaid } = await import("@/lib/db/academy");
const { generateReceiptForDeposit } = await import("@/lib/receipts/generate");
const { applyDepositOutcome } = await import("./reconcile");
import type { DepositTransaction } from "./reconcile";

function makeTransaction(overrides: Partial<DepositTransaction> = {}): DepositTransaction {
  return {
    id: "tx-1",
    pawapayId: "pp-1",
    referenceType: "starlink_subscription",
    referenceId: "site-1",
    amount: "15.00",
    currency: "USD",
    ...overrides,
  };
}

describe("applyDepositOutcome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks the starlink site as paid and generates a receipt on a COMPLETED starlink_subscription deposit", async () => {
    const tx = makeTransaction();
    await applyDepositOutcome(tx, "COMPLETED");
    expect(markStarlinkSiteSubscriptionPaid).toHaveBeenCalledWith("site-1");
    expect(generateReceiptForDeposit).toHaveBeenCalledWith(tx);
  });

  it("does nothing for a FAILED deposit", async () => {
    await applyDepositOutcome(makeTransaction(), "FAILED");
    expect(markStarlinkSiteSubscriptionPaid).not.toHaveBeenCalled();
    expect(generateReceiptForDeposit).not.toHaveBeenCalled();
  });

  it("does nothing when referenceType is missing", async () => {
    await applyDepositOutcome(makeTransaction({ referenceType: null }), "COMPLETED");
    expect(markStarlinkSiteSubscriptionPaid).not.toHaveBeenCalled();
    expect(generateReceiptForDeposit).not.toHaveBeenCalled();
  });

  it("does nothing when referenceId is missing", async () => {
    await applyDepositOutcome(makeTransaction({ referenceId: null }), "COMPLETED");
    expect(markStarlinkSiteSubscriptionPaid).not.toHaveBeenCalled();
    expect(generateReceiptForDeposit).not.toHaveBeenCalled();
  });

  it("marks the enrollment fee as paid and generates a receipt on a COMPLETED academy_fee deposit", async () => {
    const tx = makeTransaction({ referenceType: "academy_fee", referenceId: "enrollment-1" });
    await applyDepositOutcome(tx, "COMPLETED");
    expect(markEnrollmentFeePaid).toHaveBeenCalledWith("enrollment-1");
    expect(markStarlinkSiteSubscriptionPaid).not.toHaveBeenCalled();
    expect(generateReceiptForDeposit).toHaveBeenCalledWith(tx);
  });

  it("does not mark the enrollment fee paid for a FAILED academy_fee deposit", async () => {
    await applyDepositOutcome(makeTransaction({ referenceType: "academy_fee", referenceId: "enrollment-1" }), "FAILED");
    expect(markEnrollmentFeePaid).not.toHaveBeenCalled();
    expect(generateReceiptForDeposit).not.toHaveBeenCalled();
  });

  it("still marks the deposit's domain effect even if receipt generation throws", async () => {
    vi.mocked(generateReceiptForDeposit).mockRejectedValueOnce(new Error("blob upload failed"));
    await expect(applyDepositOutcome(makeTransaction(), "COMPLETED")).resolves.toBeUndefined();
    expect(markStarlinkSiteSubscriptionPaid).toHaveBeenCalledWith("site-1");
  });
});

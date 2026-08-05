import { describe, expect, it } from "vitest";
import { computePaymentsStats, type PawaPayTransaction } from "./payments";

function makeTransaction(overrides: Partial<PawaPayTransaction> = {}): PawaPayTransaction {
  return {
    id: "tx-1",
    pawapayId: "pp-1",
    type: "deposit",
    status: "COMPLETED",
    amount: "15.00",
    currency: "USD",
    payerMsisdn: "243973456789",
    referenceType: "starlink_subscription",
    referenceId: "site-1",
    rawPayload: {},
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-15T00:00:00.000Z",
    ...overrides,
  };
}

describe("computePaymentsStats", () => {
  it("handles an empty list", () => {
    const stats = computePaymentsStats([]);
    expect(stats.totalCount).toBe(0);
    expect(stats.totalCollectedLabel).toBe("$0.00");
    expect(stats.byStatus.every((s) => s.value === 0)).toBe(true);
    expect(stats.byProduct.every((p) => p.value === 0)).toBe(true);
  });

  it("buckets statuses into completed/in-progress/failed", () => {
    const stats = computePaymentsStats([
      makeTransaction({ id: "1", status: "COMPLETED" }),
      makeTransaction({ id: "2", status: "PENDING" }),
      makeTransaction({ id: "3", status: "ACCEPTED" }),
      makeTransaction({ id: "4", status: "FAILED" }),
      makeTransaction({ id: "5", status: "REJECTED" }),
    ]);

    expect(stats.totalCount).toBe(5);
    expect(stats.byStatus).toEqual([
      { label: "Completed", value: 1, tone: "good" },
      { label: "In progress", value: 2, tone: "warning" },
      { label: "Failed", value: 2, tone: "critical" },
    ]);
  });

  it("sums only COMPLETED amounts into totalCollectedLabel, formatted with 2 decimals", () => {
    const stats = computePaymentsStats([
      makeTransaction({ id: "1", status: "COMPLETED", amount: "15.00" }),
      makeTransaction({ id: "2", status: "COMPLETED", amount: "29.99" }),
      makeTransaction({ id: "3", status: "FAILED", amount: "100.00" }),
    ]);

    expect(stats.totalCollectedLabel).toBe("$44.99");
  });

  it("breaks down completed dollars by product, grouping unlinked rows separately", () => {
    const stats = computePaymentsStats([
      makeTransaction({ id: "1", status: "COMPLETED", amount: "15.00", referenceType: "starlink_subscription" }),
      makeTransaction({ id: "2", status: "COMPLETED", amount: "50.00", referenceType: "academy_fee", referenceId: "enr-1" }),
      makeTransaction({ id: "3", status: "COMPLETED", amount: "5.00", referenceType: null, referenceId: null }),
      // Not completed — shouldn't count toward any product's dollar total.
      makeTransaction({ id: "4", status: "PENDING", amount: "999.00", referenceType: "starlink_subscription" }),
    ]);

    expect(stats.byProduct).toEqual([
      { label: "Starlink", value: 15 },
      { label: "Academy", value: 50 },
      { label: "Unlinked", value: 5 },
    ]);
  });

  it("returns a 12-entry monthly trend", () => {
    const stats = computePaymentsStats([makeTransaction()]);
    expect(stats.perMonth).toHaveLength(12);
  });
});

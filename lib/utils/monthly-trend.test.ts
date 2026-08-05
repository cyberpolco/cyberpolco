import { describe, expect, it } from "vitest";
import { monthlyTrend } from "./monthly-trend";

describe("monthlyTrend", () => {
  const now = new Date(2026, 2, 15); // March 15, 2026

  it("returns one zero-filled bucket per month when given no items", () => {
    const result = monthlyTrend([], 3, now);
    expect(result).toEqual([
      { label: "Jan 26", value: 0 },
      { label: "Feb 26", value: 0 },
      { label: "Mar 26", value: 0 },
    ]);
  });

  it("counts items into the correct month bucket", () => {
    const items = [
      { createdAt: "2026-03-10T12:00:00.000Z" },
      { createdAt: "2026-03-20T12:00:00.000Z" },
      { createdAt: "2026-02-15T12:00:00.000Z" },
    ];
    const result = monthlyTrend(items, 3, now);
    expect(result).toEqual([
      { label: "Jan 26", value: 0 },
      { label: "Feb 26", value: 1 },
      { label: "Mar 26", value: 2 },
    ]);
  });

  it("drops items outside the trailing window", () => {
    const items = [{ createdAt: "2025-01-01T00:00:00.000Z" }];
    const result = monthlyTrend(items, 3, now);
    expect(result.every((b) => b.value === 0)).toBe(true);
  });

  it("sums a custom valueOf instead of counting, when given one", () => {
    const items = [
      { createdAt: "2026-03-10T12:00:00.000Z", amount: "15.00" },
      { createdAt: "2026-03-20T12:00:00.000Z", amount: "29.99" },
      { createdAt: "2026-02-15T12:00:00.000Z", amount: "5.00" },
    ];
    const result = monthlyTrend(items, 3, now, (item) => parseFloat(item.amount));
    expect(result[0]).toEqual({ label: "Jan 26", value: 0 });
    expect(result[1]).toEqual({ label: "Feb 26", value: 5 });
    // Float accumulation (15.00 + 29.99) isn't exactly 44.99 — rounding for
    // display is the caller's job (see lib/db/payments.ts's roundCents),
    // not this generic bucketing utility's.
    expect(result[2].label).toBe("Mar 26");
    expect(result[2].value).toBeCloseTo(44.99);
  });

  it("defaults valueOf to counting each item as 1", () => {
    const items = [{ createdAt: "2026-03-10T12:00:00.000Z" }, { createdAt: "2026-03-20T12:00:00.000Z" }];
    expect(monthlyTrend(items, 1, now)).toEqual([{ label: "Mar 26", value: 2 }]);
  });
});

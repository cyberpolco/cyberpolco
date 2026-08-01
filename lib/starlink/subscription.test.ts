import { describe, expect, it } from "vitest";
import { isSubscriptionPayable, subscriptionExpiryDate } from "./subscription";

describe("subscriptionExpiryDate", () => {
  it("returns null when there's no start date", () => {
    expect(subscriptionExpiryDate(null)).toBeNull();
  });

  it("adds 30 days to the start date", () => {
    expect(subscriptionExpiryDate("2026-01-01T00:00:00.000Z")).toEqual(new Date("2026-01-31T00:00:00.000Z"));
  });
});

describe("isSubscriptionPayable", () => {
  const now = new Date("2026-01-24T00:00:00.000Z");

  it("is payable when there's no start date yet (never paid)", () => {
    expect(isSubscriptionPayable(null, now)).toBe(true);
  });

  it("is not payable more than 7 days before expiry", () => {
    // Started 2026-01-01 -> expires 2026-01-31; 7 days before is 2026-01-24.
    const earlyNow = new Date("2026-01-20T00:00:00.000Z");
    expect(isSubscriptionPayable("2026-01-01T00:00:00.000Z", earlyNow)).toBe(false);
  });

  it("is payable exactly 7 days before expiry", () => {
    expect(isSubscriptionPayable("2026-01-01T00:00:00.000Z", now)).toBe(true);
  });

  it("is payable within the 7-day window", () => {
    const closeNow = new Date("2026-01-28T00:00:00.000Z");
    expect(isSubscriptionPayable("2026-01-01T00:00:00.000Z", closeNow)).toBe(true);
  });

  it("is payable once already overdue", () => {
    const overdueNow = new Date("2026-02-05T00:00:00.000Z");
    expect(isSubscriptionPayable("2026-01-01T00:00:00.000Z", overdueNow)).toBe(true);
  });
});

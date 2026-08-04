import { describe, expect, it } from "vitest";
import { canUpdatePhone, nextPhoneUpdateDate } from "./phone-cooldown";

describe("canUpdatePhone", () => {
  it("allows the update when the phone has never been changed", () => {
    expect(canUpdatePhone(null, new Date("2026-01-01T00:00:00.000Z"))).toBe(true);
  });

  it("blocks the update before 5 days have elapsed", () => {
    const now = new Date(Date.parse("2026-01-01T00:00:00.000Z") + 4 * 24 * 60 * 60 * 1000);
    expect(canUpdatePhone("2026-01-01T00:00:00.000Z", now)).toBe(false);
  });

  it("allows the update at exactly 5 days", () => {
    const now = new Date(Date.parse("2026-01-01T00:00:00.000Z") + 5 * 24 * 60 * 60 * 1000);
    expect(canUpdatePhone("2026-01-01T00:00:00.000Z", now)).toBe(true);
  });

  it("allows the update well after 5 days", () => {
    const now = new Date(Date.parse("2026-01-01T00:00:00.000Z") + 30 * 24 * 60 * 60 * 1000);
    expect(canUpdatePhone("2026-01-01T00:00:00.000Z", now)).toBe(true);
  });
});

describe("nextPhoneUpdateDate", () => {
  it("returns null when the phone has never been changed", () => {
    expect(nextPhoneUpdateDate(null)).toBeNull();
  });

  it("adds 5 days to the last update", () => {
    expect(nextPhoneUpdateDate("2026-01-01T00:00:00.000Z")).toEqual(new Date("2026-01-06T00:00:00.000Z"));
  });
});

import { describe, expect, it } from "vitest";
import { formatUsdCents, parseUsdToCents } from "./money";

describe("parseUsdToCents", () => {
  it("parses a whole-dollar amount", () => {
    expect(parseUsdToCents("50")).toBe(5000);
  });

  it("parses an amount with cents", () => {
    expect(parseUsdToCents("49.99")).toBe(4999);
  });

  it("rounds a single decimal digit", () => {
    expect(parseUsdToCents("10.5")).toBe(1050);
  });

  it("accepts zero", () => {
    expect(parseUsdToCents("0")).toBe(0);
  });

  it("rejects a negative amount", () => {
    expect(parseUsdToCents("-5")).toBeNull();
  });

  it("rejects more than 2 decimal places", () => {
    expect(parseUsdToCents("49.999")).toBeNull();
  });

  it("rejects non-numeric input", () => {
    expect(parseUsdToCents("fifty")).toBeNull();
  });

  it("rejects an empty string", () => {
    expect(parseUsdToCents("")).toBeNull();
  });

  it("tolerates surrounding whitespace", () => {
    expect(parseUsdToCents("  49.99  ")).toBe(4999);
  });
});

describe("formatUsdCents", () => {
  it("formats whole dollars with two decimal places", () => {
    expect(formatUsdCents(5000)).toBe("$50.00");
  });

  it("formats an amount with cents", () => {
    expect(formatUsdCents(4999)).toBe("$49.99");
  });

  it("formats zero", () => {
    expect(formatUsdCents(0)).toBe("$0.00");
  });
});

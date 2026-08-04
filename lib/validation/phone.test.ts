import { describe, expect, it } from "vitest";
import {
  composePhone,
  countryCodeSchema,
  localNumberSchema,
  phoneInputSchema,
  phoneSchema,
  splitPhone,
} from "./phone";

describe("countryCodeSchema", () => {
  it("accepts 1 to 3 digit codes", () => {
    expect(countryCodeSchema.safeParse("1").success).toBe(true);
    expect(countryCodeSchema.safeParse("24").success).toBe(true);
    expect(countryCodeSchema.safeParse("243").success).toBe(true);
  });

  it("rejects 4+ digit or non-digit codes", () => {
    expect(countryCodeSchema.safeParse("2431").success).toBe(false);
    expect(countryCodeSchema.safeParse("+243").success).toBe(false);
    expect(countryCodeSchema.safeParse("").success).toBe(false);
  });
});

describe("localNumberSchema", () => {
  it("accepts a 9-digit number without a leading zero unchanged", () => {
    expect(localNumberSchema.parse("991234567")).toBe("991234567");
  });

  it("strips a tolerated leading zero", () => {
    expect(localNumberSchema.parse("0991234567")).toBe("991234567");
  });

  it("rejects numbers that are too short or too long", () => {
    expect(localNumberSchema.safeParse("99123456").success).toBe(false);
    expect(localNumberSchema.safeParse("9912345678").success).toBe(false);
  });

  it("rejects a number whose first significant digit is 0", () => {
    expect(localNumberSchema.safeParse("000000000").success).toBe(false);
  });
});

describe("phoneInputSchema + composePhone", () => {
  it("composes a valid country code and local number", () => {
    const parsed = phoneInputSchema.parse({ countryCode: "243", localNumber: "0991234567" });
    expect(composePhone(parsed.countryCode, parsed.localNumber)).toBe("+243991234567");
  });
});

describe("phoneSchema", () => {
  it("accepts a well-formed composed phone", () => {
    expect(phoneSchema.safeParse("+243991234567").success).toBe(true);
  });

  it("rejects a malformed composed phone", () => {
    expect(phoneSchema.safeParse("243991234567").success).toBe(false);
    expect(phoneSchema.safeParse("+2430991234567").success).toBe(false);
  });
});

describe("splitPhone", () => {
  it("returns a default when there's no stored phone", () => {
    expect(splitPhone(null)).toEqual({ countryCode: "243", localNumber: "" });
  });

  it("round-trips a composed phone", () => {
    expect(splitPhone("+243991234567")).toEqual({ countryCode: "243", localNumber: "991234567" });
    expect(composePhone("243", "991234567")).toBe("+243991234567");
  });
});

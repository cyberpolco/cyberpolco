import { describe, expect, it } from "vitest";
import { isValidStudentId } from "./academy-options";

describe("isValidStudentId", () => {
  it("accepts the documented format: CPC + YY + F + DD + L + NNN", () => {
    expect(isValidStudentId("CPC26J18M007")).toBe(true);
    expect(isValidStudentId("CPC26A01K014")).toBe(true);
  });

  it("rejects a sequence that isn't a multiple of 7", () => {
    expect(isValidStudentId("CPC26J18M008")).toBe(false);
  });

  it("rejects a year outside 26-99", () => {
    expect(isValidStudentId("CPC25J18M007")).toBe(false);
  });

  it("rejects a day outside 01-31", () => {
    expect(isValidStudentId("CPC26J32M007")).toBe(false);
  });

  it("rejects a missing or wrong prefix", () => {
    expect(isValidStudentId("26J18M007")).toBe(false);
    expect(isValidStudentId("CPD26J18M007")).toBe(false);
  });

  it("rejects lowercase initials", () => {
    expect(isValidStudentId("cpc26j18m007")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidStudentId("")).toBe(false);
  });
});

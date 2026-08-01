import { describe, expect, it } from "vitest";
import { isValidCourseId, isValidCourseIdPrefix, isValidStudentId } from "./academy-options";

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

describe("isValidCourseIdPrefix", () => {
  it("accepts exactly 4 uppercase letters", () => {
    expect(isValidCourseIdPrefix("CYBR")).toBe(true);
  });

  it("rejects digits, lowercase, or the wrong length", () => {
    expect(isValidCourseIdPrefix("CYB1")).toBe(false);
    expect(isValidCourseIdPrefix("cybr")).toBe(false);
    expect(isValidCourseIdPrefix("CYBER")).toBe(false);
    expect(isValidCourseIdPrefix("CYB")).toBe(false);
  });
});

describe("isValidCourseId", () => {
  it("accepts the documented format: 4 letters + 2-digit year", () => {
    expect(isValidCourseId("CYBR26")).toBe(true);
  });

  it("rejects a missing or malformed year suffix", () => {
    expect(isValidCourseId("CYBR")).toBe(false);
    expect(isValidCourseId("CYBR6")).toBe(false);
    expect(isValidCourseId("CYBR260")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidCourseId("")).toBe(false);
  });
});

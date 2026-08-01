import { describe, expect, it } from "vitest";
import { isValidCourseId, isValidCourseIdPrefix, isValidStudentId } from "./academy-options";

describe("isValidStudentId", () => {
  it("accepts the documented format: CPC + YY + F + DD + L + NNN", () => {
    expect(isValidStudentId("CPC26J18M003")).toBe(true);
    expect(isValidStudentId("CPC26A01K015")).toBe(true);
  });

  it("rejects a sequence that isn't a multiple of 3", () => {
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
  it("accepts 3 uppercase letters followed by a letter", () => {
    expect(isValidCourseIdPrefix("CYBR")).toBe(true);
  });

  it("accepts 3 uppercase letters followed by a digit", () => {
    expect(isValidCourseIdPrefix("CYB1")).toBe(true);
  });

  it("rejects a digit outside the 4th position, lowercase, or the wrong length", () => {
    expect(isValidCourseIdPrefix("1YBR")).toBe(false);
    expect(isValidCourseIdPrefix("cybr")).toBe(false);
    expect(isValidCourseIdPrefix("CYBER")).toBe(false);
    expect(isValidCourseIdPrefix("CYB")).toBe(false);
  });
});

describe("isValidCourseId", () => {
  it("accepts the documented format: 3 letters + letter-or-digit + 2-digit year", () => {
    expect(isValidCourseId("CYBR26")).toBe(true);
    expect(isValidCourseId("CYB126")).toBe(true);
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

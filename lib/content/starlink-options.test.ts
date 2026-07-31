import { describe, expect, it } from "vitest";
import { isValidKitNumber } from "./starlink-options";

describe("isValidKitNumber", () => {
  it("accepts the documented format: KIT + 9 digits + 3 letters/digits", () => {
    expect(isValidKitNumber("KIT404628363H4F")).toBe(true);
  });

  it("rejects a value that's too short", () => {
    expect(isValidKitNumber("KIT40462836H4F")).toBe(false);
  });

  it("rejects a value that's too long", () => {
    expect(isValidKitNumber("KIT4046283639H4F")).toBe(false);
  });

  it("rejects a missing or wrong prefix", () => {
    expect(isValidKitNumber("404628363H4F")).toBe(false);
    expect(isValidKitNumber("KIX404628363H4F")).toBe(false);
  });

  it("rejects lowercase kit prefix", () => {
    expect(isValidKitNumber("kit404628363H4F")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidKitNumber("")).toBe(false);
  });
});

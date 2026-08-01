import { describe, expect, it } from "vitest";
import { isValidClientId, isValidKitClientId, isValidKitNumber } from "./starlink-options";

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

describe("isValidKitClientId", () => {
  it("accepts the documented site id format: STK + YY + NNNN + T + DD + SS", () => {
    expect(isValidKitClientId("STK260154E18RE")).toBe(true);
    expect(isValidKitClientId("STK260001S01RE")).toBe(true);
    expect(isValidKitClientId("STK260002M05GB")).toBe(true);
  });

  it("rejects an unknown dish type or subscription code", () => {
    expect(isValidKitClientId("STK260154X18RE")).toBe(false);
    expect(isValidKitClientId("STK260154E18ZZ")).toBe(false);
  });

  it("rejects the client-level STK-NNNN format", () => {
    expect(isValidKitClientId("STK-0001")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidKitClientId("")).toBe(false);
  });
});

describe("isValidClientId", () => {
  it("accepts the documented client id format: STK-NNNN", () => {
    expect(isValidClientId("STK-0001")).toBe(true);
  });

  it("rejects a non-4-digit sequence", () => {
    expect(isValidClientId("STK-001")).toBe(false);
    expect(isValidClientId("STK-00001")).toBe(false);
  });

  it("rejects the site-level STKYYNNNNTDDSS format", () => {
    expect(isValidClientId("STK260154E18RE")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidClientId("")).toBe(false);
  });
});

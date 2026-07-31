import { describe, expect, it } from "vitest";
import { needsApproval } from "./approval";

describe("needsApproval", () => {
  it("never requires approval for super_admin, even editing someone else's record", () => {
    expect(
      needsApproval({
        existingRecord: { createdBy: "other-user" },
        sessionUserId: "admin-1",
        sessionRole: "super_admin",
      })
    ).toBe(false);
  });

  it("never requires approval when creating a new record", () => {
    expect(
      needsApproval({
        existingRecord: undefined,
        sessionUserId: "technician-1",
        sessionRole: "technician",
      })
    ).toBe(false);
  });

  it("does not require approval when editing your own record", () => {
    expect(
      needsApproval({
        existingRecord: { createdBy: "technician-1" },
        sessionUserId: "technician-1",
        sessionRole: "technician",
      })
    ).toBe(false);
  });

  it("requires approval when editing a record created by someone else", () => {
    expect(
      needsApproval({
        existingRecord: { createdBy: "super_admin-1" },
        sessionUserId: "technician-1",
        sessionRole: "technician",
      })
    ).toBe(true);
  });

  it("requires approval for a record with no createdBy (pre-existing row), fails safe", () => {
    expect(
      needsApproval({
        existingRecord: { createdBy: null },
        sessionUserId: "teacher-1",
        sessionRole: "teacher",
      })
    ).toBe(true);
  });
});

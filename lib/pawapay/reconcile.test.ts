import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/starlink", () => ({ markStarlinkSiteSubscriptionPaid: vi.fn() }));
vi.mock("@/lib/db/academy", () => ({ markEnrollmentFeePaid: vi.fn() }));

const { markStarlinkSiteSubscriptionPaid } = await import("@/lib/db/starlink");
const { markEnrollmentFeePaid } = await import("@/lib/db/academy");
const { applyDepositOutcome } = await import("./reconcile");

describe("applyDepositOutcome", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks the starlink site as paid on a COMPLETED starlink_subscription deposit", async () => {
    await applyDepositOutcome("starlink_subscription", "site-1", "COMPLETED");
    expect(markStarlinkSiteSubscriptionPaid).toHaveBeenCalledWith("site-1");
  });

  it("does nothing for a FAILED deposit", async () => {
    await applyDepositOutcome("starlink_subscription", "site-1", "FAILED");
    expect(markStarlinkSiteSubscriptionPaid).not.toHaveBeenCalled();
  });

  it("does nothing when referenceType is missing", async () => {
    await applyDepositOutcome(null, "site-1", "COMPLETED");
    expect(markStarlinkSiteSubscriptionPaid).not.toHaveBeenCalled();
  });

  it("does nothing when referenceId is missing", async () => {
    await applyDepositOutcome("starlink_subscription", null, "COMPLETED");
    expect(markStarlinkSiteSubscriptionPaid).not.toHaveBeenCalled();
  });

  it("marks the enrollment fee as paid on a COMPLETED academy_fee deposit", async () => {
    await applyDepositOutcome("academy_fee", "enrollment-1", "COMPLETED");
    expect(markEnrollmentFeePaid).toHaveBeenCalledWith("enrollment-1");
    expect(markStarlinkSiteSubscriptionPaid).not.toHaveBeenCalled();
  });

  it("does not mark the enrollment fee paid for a FAILED academy_fee deposit", async () => {
    await applyDepositOutcome("academy_fee", "enrollment-1", "FAILED");
    expect(markEnrollmentFeePaid).not.toHaveBeenCalled();
  });
});

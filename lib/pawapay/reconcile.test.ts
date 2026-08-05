import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/starlink", () => ({ markStarlinkSiteSubscriptionPaid: vi.fn() }));

const { markStarlinkSiteSubscriptionPaid } = await import("@/lib/db/starlink");
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

  it("does nothing for an academy_fee reference (not wired up yet)", async () => {
    await applyDepositOutcome("academy_fee", "enrollment-1", "COMPLETED");
    expect(markStarlinkSiteSubscriptionPaid).not.toHaveBeenCalled();
  });
});

import { describe, expect, it } from "vitest";
import { diffFields, latestChangeByTargetId } from "./review";
import type { PendingChange } from "@/lib/db/pending-changes";

function makeChange(overrides: Partial<PendingChange> = {}): PendingChange {
  return {
    id: "change-1",
    targetTable: "article",
    targetId: "target-1",
    proposedData: {},
    proposedBy: "user-1",
    proposedAt: "2026-01-01T00:00:00.000Z",
    status: "pending",
    reviewedBy: null,
    reviewedAt: null,
    reviewNote: null,
    ...overrides,
  };
}

describe("diffFields", () => {
  it("reports a changed flat field", () => {
    const diff = diffFields({ title: "Old" }, { title: "New" });
    expect(diff.changedFlat).toEqual([{ key: "title", before: "Old", after: "New" }]);
  });

  it("reports a changed complex field with its full before/after", () => {
    const diff = diffFields({ modules: [{ id: "a" }] }, { modules: [{ id: "b" }] });
    expect(diff.changedComplex).toEqual([{ key: "modules", before: [{ id: "a" }], after: [{ id: "b" }] }]);
  });

  it("skips unchanged fields", () => {
    const diff = diffFields({ title: "Same" }, { title: "Same" });
    expect(diff.changedFlat).toEqual([]);
  });

  it("skips id/createdAt/createdBy/revalidate", () => {
    const diff = diffFields(
      { id: "1", createdAt: "a", createdBy: "b" },
      { id: "2", createdAt: "c", createdBy: "d", revalidate: [{ path: "/x" }] }
    );
    expect(diff.changedFlat).toEqual([]);
    expect(diff.changedComplex).toEqual([]);
  });
});

describe("latestChangeByTargetId", () => {
  it("keeps only the most recent change per targetId", () => {
    const older = makeChange({ id: "c1", targetId: "t1", proposedAt: "2026-01-01T00:00:00.000Z", status: "rejected" });
    const newer = makeChange({ id: "c2", targetId: "t1", proposedAt: "2026-01-02T00:00:00.000Z", status: "pending" });
    const other = makeChange({ id: "c3", targetId: "t2", proposedAt: "2026-01-01T00:00:00.000Z" });

    const latest = latestChangeByTargetId([older, newer, other]);

    expect(latest.get("t1")).toEqual(newer);
    expect(latest.get("t2")).toEqual(other);
  });

  it("is order-independent", () => {
    const older = makeChange({ id: "c1", targetId: "t1", proposedAt: "2026-01-01T00:00:00.000Z" });
    const newer = makeChange({ id: "c2", targetId: "t1", proposedAt: "2026-01-02T00:00:00.000Z" });

    expect(latestChangeByTargetId([newer, older]).get("t1")).toEqual(newer);
    expect(latestChangeByTargetId([older, newer]).get("t1")).toEqual(newer);
  });

  it("returns an empty map for no changes", () => {
    expect(latestChangeByTargetId([]).size).toBe(0);
  });
});

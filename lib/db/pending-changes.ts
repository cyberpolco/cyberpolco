import { and, count, eq } from "drizzle-orm";
import { db } from "./client";
import { pendingChanges as pendingChangesTable } from "./schema";

export type TargetTable =
  | "starlink_client"
  | "academy_course"
  | "academy_enrollment"
  | "starlink_pricing"
  | "article"
  | "team_member"
  | "service"
  | "achievement"
  | "settings"
  | "content_block";
export type PendingChangeStatus = "pending" | "approved" | "rejected";

export type PendingChange = {
  id: string;
  targetTable: TargetTable;
  targetId: string;
  proposedData: unknown;
  proposedBy: string;
  proposedAt: string;
  status: PendingChangeStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
};

export async function addPendingChange(input: {
  targetTable: TargetTable;
  targetId: string;
  proposedData: unknown;
  proposedBy: string;
}): Promise<PendingChange> {
  const [record] = await db
    .insert(pendingChangesTable)
    .values({
      ...input,
      id: crypto.randomUUID(),
      proposedAt: new Date().toISOString(),
      status: "pending",
    })
    .returning();
  return record as PendingChange;
}

export async function getPendingChanges(status?: PendingChangeStatus): Promise<PendingChange[]> {
  const items = status
    ? await db.select().from(pendingChangesTable).where(eq(pendingChangesTable.status, status))
    : await db.select().from(pendingChangesTable);
  return (items as PendingChange[]).sort((a, b) => (a.proposedAt < b.proposedAt ? 1 : -1));
}

// Count-only variant for the nav badge — avoids transferring every pending
// row's jsonb proposedData just to read rows.length.
export async function getPendingChangesCount(status?: PendingChangeStatus): Promise<number> {
  const [row] = status
    ? await db.select({ value: count() }).from(pendingChangesTable).where(eq(pendingChangesTable.status, status))
    : await db.select({ value: count() }).from(pendingChangesTable);
  return row?.value ?? 0;
}

export async function getPendingChangeById(id: string): Promise<PendingChange | undefined> {
  const [row] = await db.select().from(pendingChangesTable).where(eq(pendingChangesTable.id, id));
  return row as PendingChange | undefined;
}

// Every change a given user has ever proposed, any status — powers the
// submitter-facing "My Submissions" status page (as opposed to
// getPendingChanges, which is the super_admin review queue).
export async function getPendingChangesByProposer(proposedBy: string): Promise<PendingChange[]> {
  const items = await db.select().from(pendingChangesTable).where(eq(pendingChangesTable.proposedBy, proposedBy));
  return (items as PendingChange[]).sort((a, b) => (a.proposedAt < b.proposedAt ? 1 : -1));
}

export async function getPendingChangeForTarget(
  targetTable: TargetTable,
  targetId: string
): Promise<PendingChange | undefined> {
  const [row] = await db
    .select()
    .from(pendingChangesTable)
    .where(
      and(
        eq(pendingChangesTable.targetTable, targetTable),
        eq(pendingChangesTable.targetId, targetId),
        eq(pendingChangesTable.status, "pending")
      )
    );
  return row as PendingChange | undefined;
}

// Most recent change for a target, any status — unlike getPendingChangeForTarget
// (pending only), this also surfaces a rejected outcome so a singleton page
// (settings, a content-block page) can show why its last submission was
// turned down, not just whether one is currently awaiting review.
export async function getLatestChangeForTarget(
  targetTable: TargetTable,
  targetId: string
): Promise<PendingChange | undefined> {
  const rows = await db
    .select()
    .from(pendingChangesTable)
    .where(and(eq(pendingChangesTable.targetTable, targetTable), eq(pendingChangesTable.targetId, targetId)));
  const sorted = (rows as PendingChange[]).sort((a, b) => (a.proposedAt < b.proposedAt ? 1 : -1));
  return sorted[0];
}

export async function resolvePendingChange(
  id: string,
  status: "approved" | "rejected",
  reviewedBy: string,
  reviewNote?: string
): Promise<void> {
  await db
    .update(pendingChangesTable)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNote: reviewNote ?? null,
    })
    .where(eq(pendingChangesTable.id, id));
}

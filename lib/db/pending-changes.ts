import { and, eq } from "drizzle-orm";
import { db } from "./client";
import { pendingChanges as pendingChangesTable } from "./schema";

export type TargetTable = "starlink_client" | "academy_course" | "academy_enrollment";
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

export async function getPendingChangeById(id: string): Promise<PendingChange | undefined> {
  const [row] = await db.select().from(pendingChangesTable).where(eq(pendingChangesTable.id, id));
  return row as PendingChange | undefined;
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

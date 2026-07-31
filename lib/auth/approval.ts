import type { Role } from "./roles";

/**
 * Whether a create/edit must be queued for super_admin approval instead of
 * applying immediately. super_admin never needs approval; creating a new
 * record never needs approval; editing your own record never needs
 * approval. Everything else — including a record with no createdBy at all
 * (pre-existing rows from before this column existed) — fails safe toward
 * requiring review.
 */
export function needsApproval({
  existingRecord,
  sessionUserId,
  sessionRole,
}: {
  existingRecord: { createdBy: string | null } | undefined;
  sessionUserId: string;
  sessionRole: Role;
}): boolean {
  if (sessionRole === "super_admin") return false;
  if (!existingRecord) return false;
  return existingRecord.createdBy !== sessionUserId;
}

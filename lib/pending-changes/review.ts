import type { PendingChange } from "@/lib/db/pending-changes";
import { getStarlinkClientById } from "@/lib/db/starlink";
import { getAcademyCourseById, getAcademyEnrollmentById } from "@/lib/db/academy";
import { getSettings } from "@/lib/db/settings";
import { getArticleBySlug } from "@/lib/db/articles";
import { getTeamMemberById } from "@/lib/db/team";
import { getServiceBySlug } from "@/lib/db/services";
import { getAchievementById } from "@/lib/db/achievements";
import { getContentBlock, type ContentBundle } from "@/lib/db/content";

// Shared by both the super_admin review queue (app/admin/pending-changes)
// and the submitter-facing status page (app/admin/my-submissions) — same
// target types, same before/after rendering rules.
export const TARGET_LABELS: Record<PendingChange["targetTable"], string> = {
  starlink_client: "Starlink client",
  academy_course: "Academy course",
  academy_enrollment: "Academy student",
  starlink_pricing: "Starlink subscription pricing",
  article: "Article",
  team_member: "Team member",
  service: "Service",
  achievement: "Achievement",
  settings: "Site settings",
  content_block: "Page content",
};

export async function getLiveRecord(change: PendingChange): Promise<Record<string, unknown> | undefined> {
  switch (change.targetTable) {
    case "starlink_client":
      return getStarlinkClientById(change.targetId) as Promise<Record<string, unknown> | undefined>;
    case "academy_course":
      return getAcademyCourseById(change.targetId) as Promise<Record<string, unknown> | undefined>;
    case "academy_enrollment":
      return getAcademyEnrollmentById(change.targetId) as Promise<Record<string, unknown> | undefined>;
    case "starlink_pricing":
      return (await getSettings()).starlinkPricing;
    case "article":
      return getArticleBySlug(change.targetId) as Promise<Record<string, unknown> | undefined>;
    case "team_member":
      return getTeamMemberById(change.targetId) as Promise<Record<string, unknown> | undefined>;
    case "service":
      return getServiceBySlug(change.targetId) as Promise<Record<string, unknown> | undefined>;
    case "achievement":
      return getAchievementById(change.targetId) as Promise<Record<string, unknown> | undefined>;
    case "settings":
      return getSettings();
    case "content_block": {
      const proposal = change.proposedData as ContentBundle;
      const blocks: Record<string, unknown> = {};
      for (const key of Object.keys(proposal.blocks)) {
        blocks[key] = await getContentBlock(key);
      }
      const settings = proposal.stats || proposal.offices ? await getSettings() : undefined;
      return {
        blocks,
        ...(proposal.stats ? { stats: settings?.stats } : {}),
        ...(proposal.offices ? { offices: settings?.offices } : {}),
      };
    }
  }
}

// Skip fields that never carry a meaningful before/after for a reviewer, or
// that are objects/arrays a shallow comparison can't usefully render inline
// — those are surfaced via changedComplex (with their full values) instead,
// rendered as an expandable JSON diff so a reviewer can see them before
// deciding, not just after approving.
const SKIP_KEYS = new Set(["id", "createdAt", "createdBy", "revalidate"]);

export type FieldDiff = {
  changedFlat: { key: string; before: unknown; after: unknown }[];
  changedComplex: { key: string; before: unknown; after: unknown }[];
};

export function diffFields(before: Record<string, unknown> | undefined, after: Record<string, unknown>): FieldDiff {
  const changedFlat: FieldDiff["changedFlat"] = [];
  const changedComplex: FieldDiff["changedComplex"] = [];

  for (const key of Object.keys(after)) {
    if (SKIP_KEYS.has(key)) continue;
    const beforeValue = before?.[key];
    const afterValue = after[key];
    if (typeof afterValue === "object" && afterValue !== null) {
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
        changedComplex.push({ key, before: beforeValue, after: afterValue });
      }
      continue;
    }
    if (beforeValue !== afterValue) changedFlat.push({ key, before: beforeValue, after: afterValue });
  }

  return { changedFlat, changedComplex };
}

// Reduces a target's full change history to its single most recent change
// (any status) per targetId — used by content list pages to show "Pending
// review" or "Rejected: <note>" inline next to the item, not just on the
// submitter's separate My Submissions page. An approved-then-untouched-since
// item has no history worth surfacing, so callers only render when the
// latest status is "pending" or "rejected".
export function latestChangeByTargetId(changes: PendingChange[]): Map<string, PendingChange> {
  const latest = new Map<string, PendingChange>();
  for (const change of changes) {
    const current = latest.get(change.targetId);
    if (!current || change.proposedAt > current.proposedAt) latest.set(change.targetId, change);
  }
  return latest;
}

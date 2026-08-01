"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  saveTeamMember,
  deleteTeamMember,
  getTeamMemberById,
  getNextTeamDisplayOrder,
  type TeamMember,
} from "@/lib/db/team";
import { requireRole } from "@/lib/auth/rbac";
import { needsApproval } from "@/lib/auth/approval";
import { addPendingChange } from "@/lib/db/pending-changes";

export async function upsertTeamMemberAction(formData: FormData) {
  const session = await requireRole(["super_admin", "content_editor"]);

  const originalId = String(formData.get("originalId") || "");
  const id = originalId || crypto.randomUUID();

  const existing = originalId ? await getTeamMemberById(originalId) : undefined;
  const photo = String(formData.get("photo") || "") || existing?.photo || null;

  const displayOrder = originalId
    ? Number(formData.get("displayOrder") || 0)
    : await getNextTeamDisplayOrder();

  const member: TeamMember = {
    id,
    name: String(formData.get("name") || ""),
    photo,
    displayOrder,
    fr: {
      title: String(formData.get("title_fr") || ""),
      bio: String(formData.get("bio_fr") || ""),
    },
    en: {
      title: String(formData.get("title_en") || ""),
      bio: String(formData.get("bio_en") || ""),
    },
  };

  // Team members have no createdBy/ownership concept — see the identical
  // comment in lib/actions/articles.ts.
  if (
    existing &&
    needsApproval({ existingRecord: { createdBy: null }, sessionUserId: session.userId, sessionRole: session.role })
  ) {
    await addPendingChange({
      targetTable: "team_member",
      targetId: existing.id,
      proposedData: member,
      proposedBy: session.userId,
    });
    redirect("/admin/cms/team?pending=1");
  }

  await saveTeamMember(member);
  revalidatePath("/admin/cms/team");
  revalidatePath("/[locale]/about", "page");
  redirect("/admin/cms/team");
}

export async function deleteTeamMemberAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  const id = String(formData.get("id") || "");
  await deleteTeamMember(id);
  revalidatePath("/admin/cms/team");
  revalidatePath("/[locale]/about", "page");
}

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

export async function upsertTeamMemberAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

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

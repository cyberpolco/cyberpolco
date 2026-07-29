"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  saveAchievement,
  deleteAchievement,
  getAchievementById,
  type Achievement,
} from "@/lib/db/achievements";
import { requireRole } from "@/lib/auth/rbac";

function resolveImage(formData: FormData, fieldName: string, existingUrl: string | null): string | null {
  return String(formData.get(fieldName) || "") || existingUrl;
}

export async function upsertAchievementAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  const originalId = String(formData.get("id") || "");
  const id = originalId || crypto.randomUUID();

  const existing = originalId ? await getAchievementById(originalId) : undefined;
  const image1 = resolveImage(formData, "image1", existing?.image1 ?? null);
  const image2 = resolveImage(formData, "image2", existing?.image2 ?? null);

  const achievement: Achievement = {
    id,
    date: String(formData.get("date") || ""),
    image1,
    image2,
    fr: {
      title: String(formData.get("title_fr") || ""),
      description: String(formData.get("description_fr") || ""),
    },
    en: {
      title: String(formData.get("title_en") || ""),
      description: String(formData.get("description_en") || ""),
    },
  };

  await saveAchievement(achievement);
  revalidatePath("/admin/cms/achievements");
  revalidatePath("/[locale]/achievements", "page");
  redirect("/admin/cms/achievements");
}

export async function deleteAchievementAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  const id = String(formData.get("id") || "");
  await deleteAchievement(id);
  revalidatePath("/admin/cms/achievements");
  revalidatePath("/[locale]/achievements", "page");
}

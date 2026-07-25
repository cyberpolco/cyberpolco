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
import { storeAchievementImageFile } from "@/lib/db/file-storage";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/validation/schemas";

async function resolveImage(
  formData: FormData,
  fieldName: string,
  existingUrl: string | null,
  redirectTarget: string
): Promise<string | null> {
  const file = formData.get(fieldName);
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      redirect(`${redirectTarget}?error=file-type`);
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      redirect(`${redirectTarget}?error=file-size`);
    }
    const stored = await storeAchievementImageFile(file);
    return stored.url;
  }
  return existingUrl;
}

export async function upsertAchievementAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  const originalId = String(formData.get("id") || "");
  const id = originalId || crypto.randomUUID();
  const redirectTarget = originalId
    ? `/admin/cms/achievements/${originalId}/edit`
    : "/admin/cms/achievements/new";

  const existing = originalId ? await getAchievementById(originalId) : undefined;
  const image1 = await resolveImage(formData, "image1", existing?.image1 ?? null, redirectTarget);
  const image2 = await resolveImage(formData, "image2", existing?.image2 ?? null, redirectTarget);

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

"use server";

import { revalidatePath } from "next/cache";
import { getSettings, saveSettings } from "@/lib/db/settings";
import { requireRole } from "@/lib/auth/rbac";

export async function updateSettingsAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  const current = await getSettings();

  const socialLinks = {
    x: String(formData.get("social_x") || current.socialLinks.x),
    linkedin: String(formData.get("social_linkedin") || current.socialLinks.linkedin),
    tiktok: String(formData.get("social_tiktok") || current.socialLinks.tiktok),
    youtube: String(formData.get("social_youtube") || current.socialLinks.youtube),
    github: String(formData.get("social_github") || current.socialLinks.github),
    whatsappChannel: String(
      formData.get("social_whatsapp") || current.socialLinks.whatsappChannel
    ),
  };

  await saveSettings({ ...current, socialLinks });

  // "layout" since social links are rendered in the footer across every
  // page, not just the homepage.
  revalidatePath("/[locale]", "layout");
  revalidatePath("/admin/cms/settings");
}

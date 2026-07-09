"use server";

import { revalidatePath } from "next/cache";
import { getSettings, saveSettings } from "@/lib/db/settings";

export async function updateSettingsAction(formData: FormData) {
  const current = await getSettings();

  const stats = current.stats.map((s, i) => ({
    ...s,
    value: String(formData.get(`stat_value_${i}`) || s.value),
    fr: String(formData.get(`stat_fr_${i}`) || s.fr),
    en: String(formData.get(`stat_en_${i}`) || s.en),
  }));

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

  await saveSettings({ stats, socialLinks });

  revalidatePath("/[locale]", "page");
  revalidatePath("/admin/settings");
}

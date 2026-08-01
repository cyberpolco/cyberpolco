"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSettings, saveSettings } from "@/lib/db/settings";
import { requireRole } from "@/lib/auth/rbac";
import { needsApproval } from "@/lib/auth/approval";
import { addPendingChange } from "@/lib/db/pending-changes";

export async function updateSettingsAction(formData: FormData) {
  const session = await requireRole(["super_admin", "content_editor"]);

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

  // Settings is a global singleton with no owner — always needs review from
  // a non-super_admin, same as Starlink pricing (lib/actions/starlink.ts).
  if (
    needsApproval({ existingRecord: { createdBy: null }, sessionUserId: session.userId, sessionRole: session.role })
  ) {
    await addPendingChange({
      targetTable: "settings",
      targetId: "singleton",
      proposedData: { socialLinks },
      proposedBy: session.userId,
    });
    redirect("/admin/cms/settings?pending=1");
  }

  await saveSettings({ ...current, socialLinks });

  // "layout" since social links are rendered in the footer across every
  // page, not just the homepage.
  revalidatePath("/[locale]", "layout");
  revalidatePath("/admin/cms/settings");
}

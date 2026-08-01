"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { getPendingChangeById, resolvePendingChange } from "@/lib/db/pending-changes";
import { saveStarlinkClient, type StarlinkClient } from "@/lib/db/starlink";
import { saveAcademyCourse, saveAcademyEnrollment, type AcademyCourse, type AcademyEnrollment } from "@/lib/db/academy";
import { getSettings, saveSettings, type SiteSettings } from "@/lib/db/settings";
import { saveArticle, deleteArticle, type Article } from "@/lib/db/articles";
import { saveTeamMember, type TeamMember } from "@/lib/db/team";
import { saveService, type Service } from "@/lib/db/services";
import { saveAchievement, type Achievement } from "@/lib/db/achievements";
import { applyContentBundle, type ContentBundle } from "@/lib/db/content";
import type { SubscriptionPricingCents } from "@/lib/content/starlink-options";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "");
}

export async function approvePendingChangeAction(formData: FormData) {
  const session = await requireRole(["super_admin"]);

  const id = field(formData, "id");
  const change = await getPendingChangeById(id);
  if (!change || change.status !== "pending") {
    revalidatePath("/admin/pending-changes");
    return;
  }

  switch (change.targetTable) {
    case "starlink_client":
      await saveStarlinkClient(change.proposedData as StarlinkClient);
      revalidatePath("/admin/starlink");
      break;
    case "academy_course":
      await saveAcademyCourse(change.proposedData as AcademyCourse);
      revalidatePath("/admin/academy/courses");
      break;
    case "academy_enrollment":
      await saveAcademyEnrollment(change.proposedData as AcademyEnrollment);
      revalidatePath("/admin/academy/students");
      revalidatePath(`/admin/academy/students/${change.targetId}`);
      break;
    case "starlink_pricing": {
      const current = await getSettings();
      await saveSettings({ ...current, starlinkPricing: change.proposedData as SubscriptionPricingCents });
      revalidatePath("/admin/starlink");
      revalidatePath("/admin/dashboard");
      break;
    }
    case "article": {
      const proposed = change.proposedData as Article;
      // Articles are keyed by slug — see the identical rename-orphan comment
      // in lib/actions/articles.ts.
      if (change.targetId && change.targetId !== proposed.slug) {
        await deleteArticle(change.targetId);
      }
      await saveArticle(proposed);
      revalidatePath("/admin/articles");
      revalidatePath("/[locale]/articles", "page");
      revalidatePath("/[locale]/articles/[slug]", "page");
      revalidatePath("/[locale]", "layout");
      revalidatePath("/sitemap.xml");
      break;
    }
    case "team_member":
      await saveTeamMember(change.proposedData as TeamMember);
      revalidatePath("/admin/cms/team");
      revalidatePath("/[locale]/about", "page");
      break;
    case "service":
      await saveService(change.proposedData as Service & { displayOrder: number });
      revalidatePath("/admin/cms/services");
      revalidatePath("/[locale]/services", "page");
      revalidatePath("/[locale]/services/[slug]", "page");
      revalidatePath("/[locale]", "layout");
      revalidatePath("/sitemap.xml");
      break;
    case "achievement":
      await saveAchievement(change.proposedData as Achievement);
      revalidatePath("/admin/cms/achievements");
      revalidatePath("/[locale]/achievements", "page");
      break;
    case "settings": {
      const current = await getSettings();
      await saveSettings({ ...current, ...(change.proposedData as Partial<SiteSettings>) });
      revalidatePath("/[locale]", "layout");
      revalidatePath("/admin/cms/settings");
      break;
    }
    case "content_block":
      await applyContentBundle(change.proposedData as ContentBundle);
      break;
  }

  await resolvePendingChange(id, "approved", session.userId);
  revalidatePath("/admin/pending-changes");
}

export async function rejectPendingChangeAction(formData: FormData) {
  const session = await requireRole(["super_admin"]);

  const id = field(formData, "id");
  const note = field(formData, "reviewNote") || undefined;
  await resolvePendingChange(id, "rejected", session.userId, note);
  revalidatePath("/admin/pending-changes");
}

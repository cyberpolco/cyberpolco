"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { getPendingChangeById, resolvePendingChange } from "@/lib/db/pending-changes";
import { saveStarlinkClient, type StarlinkClient } from "@/lib/db/starlink";
import { saveAcademyCourse, saveAcademyEnrollment, type AcademyCourse, type AcademyEnrollment } from "@/lib/db/academy";
import { getSettings, saveSettings } from "@/lib/db/settings";
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

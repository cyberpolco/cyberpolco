"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { saveTemplate } from "@/lib/db/templates";
import { TEMPLATE_REGISTRY, type TemplateKey } from "@/lib/email/template-registry";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "");
}

function isTemplateKey(value: string): value is TemplateKey {
  return value in TEMPLATE_REGISTRY;
}

export async function updateTemplateAction(formData: FormData) {
  const session = await requireRole(["super_admin", "hr_recruiter"]);

  const key = field(formData, "key");
  if (!isTemplateKey(key)) {
    throw new Error(`Unknown template key "${key}".`);
  }

  await saveTemplate(
    key,
    {
      fr: { subject: field(formData, "subject_fr"), body: field(formData, "body_fr") },
      en: { subject: field(formData, "subject_en"), body: field(formData, "body_en") },
    },
    session.userId
  );

  revalidatePath("/admin/templates");
  redirect("/admin/templates");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveJob, deleteJob, type Job } from "@/lib/db/jobs";
import { requireRole } from "@/lib/auth/rbac";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function upsertJobAction(formData: FormData) {
  await requireRole(["super_admin", "hr_recruiter"]);

  const id = String(formData.get("id") || crypto.randomUUID());
  const title_en = String(formData.get("title_en") || "");
  const title_fr = String(formData.get("title_fr") || "");
  const existingSlug = String(formData.get("existingSlug") || "");

  const job: Job = {
    id,
    slug: existingSlug || slugify(title_en || title_fr),
    status: (formData.get("status") as "open" | "closed") || "open",
    createdAt: String(formData.get("createdAt") || new Date().toISOString()),
    fr: {
      title: title_fr,
      location: String(formData.get("location_fr") || ""),
      type: String(formData.get("type_fr") || ""),
      description: String(formData.get("description_fr") || ""),
    },
    en: {
      title: title_en,
      location: String(formData.get("location_en") || ""),
      type: String(formData.get("type_en") || ""),
      description: String(formData.get("description_en") || ""),
    },
  };

  await saveJob(job);
  revalidatePath("/admin/jobs");
  revalidatePath("/[locale]/careers", "page");
  redirect("/admin/jobs");
}

export async function deleteJobAction(formData: FormData) {
  await requireRole(["super_admin", "hr_recruiter"]);

  const id = String(formData.get("id") || "");
  await deleteJob(id);
  revalidatePath("/admin/jobs");
  revalidatePath("/[locale]/careers", "page");
}

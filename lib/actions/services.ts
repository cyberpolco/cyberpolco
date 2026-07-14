"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  saveService,
  deleteService,
  getNextDisplayOrder,
  type Service,
} from "@/lib/db/services";
import { requireRole } from "@/lib/auth/rbac";
import type { ServiceIconKey } from "@/lib/content/service-icons";
import { isTextAlign, type TextAlign } from "@/lib/types/text-align";

function textAlign(formData: FormData, name: string): TextAlign {
  const value = formData.get(name);
  return isTextAlign(value) ? value : "left";
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function upsertServiceAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  const originalSlug = String(formData.get("originalSlug") || "");
  const name_fr = String(formData.get("name_fr") || "");
  const name_en = String(formData.get("name_en") || "");
  const slug = originalSlug || slugify(name_en || name_fr);
  const icon = String(formData.get("icon") || "shield") as ServiceIconKey;
  const displayOrder = originalSlug
    ? Number(formData.get("displayOrder") || 0)
    : await getNextDisplayOrder();

  const service: Service & { displayOrder: number } = {
    slug,
    icon,
    displayOrder,
    fr: {
      name: name_fr,
      tagline: String(formData.get("tagline_fr") || ""),
      description: String(formData.get("description_fr") || ""),
      descriptionAlign: textAlign(formData, "descriptionAlign_fr"),
      bullets: String(formData.get("bullets_fr") || "")
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
    },
    en: {
      name: name_en,
      tagline: String(formData.get("tagline_en") || ""),
      description: String(formData.get("description_en") || ""),
      descriptionAlign: textAlign(formData, "descriptionAlign_en"),
      bullets: String(formData.get("bullets_en") || "")
        .split("\n")
        .map((b) => b.trim())
        .filter(Boolean),
    },
  };

  await saveService(service);
  revalidatePath("/admin/cms/services");
  revalidatePath("/[locale]/services", "page");
  revalidatePath("/[locale]/services/[slug]", "page");
  // "layout" since services also appear in the footer (shared across every
  // page) and on the homepage, not just the /services pages.
  revalidatePath("/[locale]", "layout");
  redirect("/admin/cms/services");
}

export async function deleteServiceAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  const slug = String(formData.get("slug") || "");
  await deleteService(slug);
  revalidatePath("/admin/cms/services");
  revalidatePath("/[locale]/services", "page");
  revalidatePath("/[locale]", "layout");
}

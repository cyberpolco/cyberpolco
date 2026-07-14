"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveArticle, deleteArticle } from "@/lib/db/articles";
import { requireRole } from "@/lib/auth/rbac";
import type { Article } from "@/lib/content/articles";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function upsertArticleAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  const originalSlug = String(formData.get("originalSlug") || "");
  const title_fr = String(formData.get("title_fr") || "");
  const title_en = String(formData.get("title_en") || "");

  const slug = originalSlug || slugify(title_en || title_fr);

  const image = String(formData.get("image") || "").trim();

  const article: Article = {
    slug,
    date: String(formData.get("date") || new Date().toISOString().slice(0, 10)),
    image: image || undefined,
    fr: {
      title: title_fr,
      excerpt: String(formData.get("excerpt_fr") || ""),
      body: String(formData.get("body_fr") || "")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    },
    en: {
      title: title_en,
      excerpt: String(formData.get("excerpt_en") || ""),
      body: String(formData.get("body_en") || "")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    },
  };

  await saveArticle(article);
  revalidatePath("/admin/articles");
  revalidatePath("/[locale]/articles", "page");
  revalidatePath("/[locale]", "page");
  redirect("/admin/articles");
}

export async function deleteArticleAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  const slug = String(formData.get("slug") || "");
  await deleteArticle(slug);
  revalidatePath("/admin/articles");
  revalidatePath("/[locale]/articles", "page");
}

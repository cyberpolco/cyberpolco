"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { saveArticle, deleteArticle, getArticleBySlug } from "@/lib/db/articles";
import { requireRole } from "@/lib/auth/rbac";
import { needsApproval } from "@/lib/auth/approval";
import { addPendingChange } from "@/lib/db/pending-changes";
import type { Article } from "@/lib/content/articles";
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

export async function upsertArticleAction(formData: FormData) {
  const session = await requireRole(["super_admin", "content_editor"]);

  const originalSlug = String(formData.get("originalSlug") || "");
  const submittedSlug = String(formData.get("slug") || "").trim();
  const title_fr = String(formData.get("title_fr") || "");
  const title_en = String(formData.get("title_en") || "");

  // The slug field is user-editable now (see ArticleForm.tsx), so it's the
  // primary source; falling back to a title-derived slug only covers the
  // defensive case of it somehow arriving blank.
  const slug = slugify(submittedSlug) || slugify(title_en || title_fr);

  const image = String(formData.get("image") || "").trim();

  const article: Article = {
    slug,
    date: String(formData.get("date") || new Date().toISOString().slice(0, 10)),
    image: image || undefined,
    fr: {
      title: title_fr,
      excerpt: String(formData.get("excerpt_fr") || ""),
      excerptAlign: textAlign(formData, "excerptAlign_fr"),
      body: String(formData.get("body_fr") || "")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
      bodyAlign: textAlign(formData, "bodyAlign_fr"),
    },
    en: {
      title: title_en,
      excerpt: String(formData.get("excerpt_en") || ""),
      excerptAlign: textAlign(formData, "excerptAlign_en"),
      body: String(formData.get("body_en") || "")
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
      bodyAlign: textAlign(formData, "bodyAlign_en"),
    },
  };

  // Articles have no createdBy/ownership concept, so — like the other
  // no-owner content types — any edit of an existing article by a
  // non-super_admin always needs review; only creating a brand new one
  // is free (see lib/auth/approval.ts).
  const existing = originalSlug ? await getArticleBySlug(originalSlug) : undefined;
  if (
    existing &&
    needsApproval({ existingRecord: { createdBy: null }, sessionUserId: session.userId, sessionRole: session.role })
  ) {
    await addPendingChange({
      targetTable: "article",
      targetId: originalSlug,
      proposedData: article,
      proposedBy: session.userId,
    });
    redirect("/admin/articles?pending=1");
  }

  await saveArticle(article);
  // Articles are keyed by slug (onConflictDoUpdate targets it), so editing
  // the slug on an existing article inserts a new row rather than renaming
  // the old one in place — without this, the old slug's row would be left
  // behind as an orphan.
  if (originalSlug && originalSlug !== slug) {
    await deleteArticle(originalSlug);
  }
  revalidatePath("/admin/articles");
  revalidatePath("/[locale]/articles", "page");
  revalidatePath("/[locale]/articles/[slug]", "page");
  revalidatePath("/[locale]", "page");
  revalidatePath("/sitemap.xml");
  redirect("/admin/articles");
}

export async function deleteArticleAction(formData: FormData) {
  await requireRole(["super_admin", "content_editor"]);

  const slug = String(formData.get("slug") || "");
  await deleteArticle(slug);
  revalidatePath("/admin/articles");
  revalidatePath("/[locale]/articles", "page");
  revalidatePath("/[locale]/articles/[slug]", "page");
  revalidatePath("/[locale]", "page");
  revalidatePath("/sitemap.xml");
}

"use client";

import { useState } from "react";
import Image from "next/image";
import { upsertArticleAction } from "@/lib/actions/articles";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import BlobFileField from "@/app/admin/_components/BlobFileField";
import type { Article } from "@/lib/content/articles";
import AlignedTextarea from "@/app/admin/_components/AlignedTextarea";

export default function ArticleForm({ article }: { article?: Article }) {
  const [image, setImage] = useState(article?.image || "");

  return (
    <form action={upsertArticleAction} className="space-y-8">
      <input type="hidden" name="originalSlug" value={article?.slug || ""} />

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Publish date</label>
        <input
          type="date"
          name="date"
          defaultValue={article?.date}
          required
          className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Thumbnail image</label>
        {image && (
          <div className="relative mb-3 h-32 w-56 overflow-hidden rounded-xl border border-black/5 dark:border-white/10">
            <Image src={image} alt="" fill sizes="224px" className="object-cover" />
          </div>
        )}
        <BlobFileField
          kind="article-thumbnail"
          name="image"
          accept="image/jpeg,image/png,image/webp"
          value={image}
          onChange={setImage}
          className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 text-sm dark:bg-white/5 dark:text-white"
        />
        <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
          Also used as the link preview image when this article is shared. {image ? "Leave blank to keep the current image." : "Leave blank to use the placeholder."}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">Français</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Titre</label>
            <input
              name="title_fr"
              defaultValue={article?.fr.title}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Extrait</label>
            <AlignedTextarea
              name="excerpt_fr"
              alignName="excerptAlign_fr"
              defaultValue={article?.fr.excerpt}
              defaultAlign={article?.fr.excerptAlign}
              rows={2}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
              Corps (séparez les paragraphes par une ligne vide)
            </label>
            <AlignedTextarea
              name="body_fr"
              alignName="bodyAlign_fr"
              defaultValue={article?.fr.body.join("\n\n")}
              defaultAlign={article?.fr.bodyAlign}
              rows={10}
              required
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">English</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Title</label>
            <input
              name="title_en"
              defaultValue={article?.en.title}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Excerpt</label>
            <AlignedTextarea
              name="excerpt_en"
              alignName="excerptAlign_en"
              defaultValue={article?.en.excerpt}
              defaultAlign={article?.en.excerptAlign}
              rows={2}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
              Body (separate paragraphs with a blank line)
            </label>
            <AlignedTextarea
              name="body_en"
              alignName="bodyAlign_en"
              defaultValue={article?.en.body.join("\n\n")}
              defaultAlign={article?.en.bodyAlign}
              rows={10}
              required
            />
          </div>
        </fieldset>
      </div>

      <SubmitButton>Save article</SubmitButton>
    </form>
  );
}

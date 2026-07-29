"use client";

import { useState } from "react";
import Image from "next/image";
import { upsertAchievementAction } from "@/lib/actions/achievements";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import BlobFileField from "@/app/admin/_components/BlobFileField";
import type { Achievement } from "@/lib/db/achievements";

function PhotoField({
  name,
  label,
  value,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">{label}</label>
      {value && (
        <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-xl border border-black/5 dark:border-white/10">
          <Image src={value} alt="" fill sizes="80px" className="object-cover" />
        </div>
      )}
      <BlobFileField
        kind="achievement-photo"
        name={name}
        accept="image/jpeg,image/png,image/webp"
        value={value}
        onChange={onChange}
        className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 text-sm dark:bg-white/5 dark:text-white"
      />
      <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
        {value ? "Leave blank to keep the current photo." : "Optional."}
      </p>
    </div>
  );
}

export default function AchievementForm({ achievement }: { achievement?: Achievement }) {
  const [image1, setImage1] = useState(achievement?.image1 || "");
  const [image2, setImage2] = useState(achievement?.image2 || "");

  return (
    <form action={upsertAchievementAction} className="space-y-8">
      <input type="hidden" name="id" value={achievement?.id || ""} />

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
          Milestone date
        </label>
        <input
          type="date"
          name="date"
          defaultValue={achievement?.date}
          required
          className="w-full max-w-xs rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <PhotoField name="image1" label="Photo 1" value={image1} onChange={setImage1} />
        <PhotoField name="image2" label="Photo 2" value={image2} onChange={setImage2} />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">Français</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Titre</label>
            <input
              name="title_fr"
              defaultValue={achievement?.fr.title}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Description</label>
            <textarea
              name="description_fr"
              defaultValue={achievement?.fr.description}
              rows={4}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">English</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Title</label>
            <input
              name="title_en"
              defaultValue={achievement?.en.title}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Description</label>
            <textarea
              name="description_en"
              defaultValue={achievement?.en.description}
              rows={4}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
        </fieldset>
      </div>

      <SubmitButton>Save achievement</SubmitButton>
    </form>
  );
}

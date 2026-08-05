"use client";

import { useState } from "react";
import { upsertJobAction } from "@/lib/actions/jobs";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { toDatetimeLocalValue, type Job } from "@/lib/db/jobs";
import AlignedTextarea from "@/app/admin/_components/AlignedTextarea";
import { CONTRACT_TYPE_OPTIONS } from "@/lib/content/job-options";

// Keeps a legacy or previously-mismatched fr/en pair (from before the two
// dropdowns were linked) selectable and visible instead of silently
// overwriting it with the first canonical pair on next save.
function pairsWithCurrent(currentFr?: string, currentEn?: string) {
  const matchesCanonicalPair = CONTRACT_TYPE_OPTIONS.some((p) => p.fr === currentFr && p.en === currentEn);
  if (matchesCanonicalPair || !currentFr || !currentEn) return CONTRACT_TYPE_OPTIONS;
  return [{ fr: currentFr, en: currentEn }, ...CONTRACT_TYPE_OPTIONS];
}

export default function JobForm({ job }: { job?: Job }) {
  const typePairs = pairsWithCurrent(job?.fr.type, job?.en.type);
  const initialTypeIndex = Math.max(
    0,
    typePairs.findIndex((p) => p.fr === job?.fr.type && p.en === job?.en.type)
  );
  const [typeIndex, setTypeIndex] = useState(initialTypeIndex);
  const selectedType = typePairs[typeIndex];
  return (
    <form action={upsertJobAction} className="space-y-6">
      <input type="hidden" name="id" value={job?.id || ""} />
      <input type="hidden" name="existingSlug" value={job?.slug || ""} />
      <input type="hidden" name="createdAt" value={job?.createdAt || ""} />

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Status</label>
          <select
            name="status"
            defaultValue={job?.status || "draft"}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Opens at</label>
          <input
            type="datetime-local"
            name="openAt"
            defaultValue={toDatetimeLocalValue(job?.openAt ?? null)}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Closes at</label>
          <input
            type="datetime-local"
            name="closeAt"
            defaultValue={toDatetimeLocalValue(job?.closeAt ?? null)}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>
      <p className="text-xs text-brand-gray dark:text-white/60">
        Status must be &quot;Open&quot; for this posting to ever go public. Leave the dates blank to skip
        scheduling — with Status set to Open and no dates, the posting is public immediately and stays open
        until you close or edit it. Set &quot;Opens at&quot; / &quot;Closes at&quot; to have it publish and/or
        stop accepting applications automatically, with no need to come back and flip the status yourself.
      </p>

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">Français</legend>
          <Field label="Titre du poste" name="title_fr" defaultValue={job?.fr.title} />
          <Field label="Lieu" name="location_fr" defaultValue={job?.fr.location} />
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Type de contrat</label>
            <select
              name="type_fr"
              value={selectedType.fr}
              onChange={(e) => setTypeIndex(typePairs.findIndex((p) => p.fr === e.target.value))}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            >
              {typePairs.map((p, i) => (
                <option key={i} value={p.fr}>
                  {p.fr}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Description</label>
            <AlignedTextarea
              name="description_fr"
              alignName="descriptionAlign_fr"
              defaultValue={job?.fr.description}
              defaultAlign={job?.fr.descriptionAlign}
              rows={8}
              required
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">English</legend>
          <Field label="Job title" name="title_en" defaultValue={job?.en.title} />
          <Field label="Location" name="location_en" defaultValue={job?.en.location} />
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Contract type</label>
            <select
              name="type_en"
              value={selectedType.en}
              onChange={(e) => setTypeIndex(typePairs.findIndex((p) => p.en === e.target.value))}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            >
              {typePairs.map((p, i) => (
                <option key={i} value={p.en}>
                  {p.en}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Description</label>
            <AlignedTextarea
              name="description_en"
              alignName="descriptionAlign_en"
              defaultValue={job?.en.description}
              defaultAlign={job?.en.descriptionAlign}
              rows={8}
              required
            />
          </div>
        </fieldset>
      </div>

      <SubmitButton>Save job</SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required
        className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
      />
    </div>
  );
}

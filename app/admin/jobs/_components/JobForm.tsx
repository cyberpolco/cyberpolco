import { upsertJobAction } from "@/lib/actions/jobs";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import type { Job } from "@/lib/db/jobs";
import AlignedTextarea from "@/app/admin/_components/AlignedTextarea";
import { CONTRACT_TYPE_OPTIONS_FR, CONTRACT_TYPE_OPTIONS_EN } from "@/lib/content/job-options";

// Keeps a legacy free-text value (from before this was a dropdown) selectable
// and visible instead of the <select> silently falling back to the first
// option and quietly rewriting it on next save.
function optionsWithCurrent(options: readonly string[], current?: string): string[] {
  return current && !options.includes(current) ? [current, ...options] : [...options];
}

export default function JobForm({ job }: { job?: Job }) {
  const typeOptionsFr = optionsWithCurrent(CONTRACT_TYPE_OPTIONS_FR, job?.fr.type);
  const typeOptionsEn = optionsWithCurrent(CONTRACT_TYPE_OPTIONS_EN, job?.en.type);
  return (
    <form action={upsertJobAction} className="space-y-6">
      <input type="hidden" name="id" value={job?.id || ""} />
      <input type="hidden" name="existingSlug" value={job?.slug || ""} />
      <input type="hidden" name="createdAt" value={job?.createdAt || ""} />

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Status</label>
        <select
          name="status"
          defaultValue={job?.status || "open"}
          className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">Français</legend>
          <Field label="Titre du poste" name="title_fr" defaultValue={job?.fr.title} />
          <Field label="Lieu" name="location_fr" defaultValue={job?.fr.location} />
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Type de contrat</label>
            <select
              name="type_fr"
              defaultValue={job?.fr.type || CONTRACT_TYPE_OPTIONS_FR[0]}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            >
              {typeOptionsFr.map((t) => (
                <option key={t} value={t}>
                  {t}
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
              defaultValue={job?.en.type || CONTRACT_TYPE_OPTIONS_EN[0]}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            >
              {typeOptionsEn.map((t) => (
                <option key={t} value={t}>
                  {t}
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

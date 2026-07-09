import { upsertJobAction } from "@/lib/actions/jobs";
import type { Job } from "@/lib/db/jobs";

export default function JobForm({ job }: { job?: Job }) {
  return (
    <form action={upsertJobAction} className="space-y-6">
      <input type="hidden" name="id" value={job?.id || ""} />
      <input type="hidden" name="existingSlug" value={job?.slug || ""} />
      <input type="hidden" name="createdAt" value={job?.createdAt || ""} />

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">Status</label>
        <select
          name="status"
          defaultValue={job?.status || "open"}
          className="rounded-lg border border-black/10 px-4 py-2.5"
        >
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-4 rounded-2xl border border-black/5 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">Français</legend>
          <Field label="Titre du poste" name="title_fr" defaultValue={job?.fr.title} />
          <Field label="Lieu" name="location_fr" defaultValue={job?.fr.location} />
          <Field label="Type de contrat" name="type_fr" defaultValue={job?.fr.type} />
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Description</label>
            <textarea
              name="description_fr"
              defaultValue={job?.fr.description}
              rows={8}
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-black/5 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">English</legend>
          <Field label="Job title" name="title_en" defaultValue={job?.en.title} />
          <Field label="Location" name="location_en" defaultValue={job?.en.location} />
          <Field label="Contract type" name="type_en" defaultValue={job?.en.type} />
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Description</label>
            <textarea
              name="description_en"
              defaultValue={job?.en.description}
              rows={8}
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5"
            />
          </div>
        </fieldset>
      </div>

      <button
        type="submit"
        className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
      >
        Save job
      </button>
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
      <label className="mb-1 block text-sm font-medium text-brand-dark">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required
        className="w-full rounded-lg border border-black/10 px-4 py-2.5"
      />
    </div>
  );
}

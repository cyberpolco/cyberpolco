import { upsertServiceAction } from "@/lib/actions/services";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { SERVICE_ICON_OPTIONS } from "@/lib/content/service-icons";
import type { Service } from "@/lib/db/services";
import AlignedTextarea from "@/app/admin/_components/AlignedTextarea";

export default function ServiceForm({ service }: { service?: Service }) {
  return (
    <form action={upsertServiceAction} className="space-y-8">
      <input type="hidden" name="originalSlug" value={service?.slug || ""} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Icon</label>
          <select
            name="icon"
            defaultValue={service?.icon ?? "shield"}
            className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
          >
            {SERVICE_ICON_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        {service && (
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
              Display order
            </label>
            <input
              type="number"
              name="displayOrder"
              defaultValue={service.displayOrder ?? 0}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
            <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
              Lower numbers appear first. The homepage shows the first 4.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">Français</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Nom</label>
            <input
              name="name_fr"
              defaultValue={service?.fr.name}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Accroche</label>
            <input
              name="tagline_fr"
              defaultValue={service?.fr.tagline}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Description</label>
            <AlignedTextarea
              name="description_fr"
              alignName="descriptionAlign_fr"
              defaultValue={service?.fr.description}
              defaultAlign={service?.fr.descriptionAlign}
              rows={4}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
              Points clés (un par ligne)
            </label>
            <textarea
              name="bullets_fr"
              defaultValue={service?.fr.bullets.join("\n")}
              rows={4}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">English</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Name</label>
            <input
              name="name_en"
              defaultValue={service?.en.name}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Tagline</label>
            <input
              name="tagline_en"
              defaultValue={service?.en.tagline}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Description</label>
            <AlignedTextarea
              name="description_en"
              alignName="descriptionAlign_en"
              defaultValue={service?.en.description}
              defaultAlign={service?.en.descriptionAlign}
              rows={4}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
              Bullet points (one per line)
            </label>
            <textarea
              name="bullets_en"
              defaultValue={service?.en.bullets.join("\n")}
              rows={4}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
        </fieldset>
      </div>

      <SubmitButton>Save service</SubmitButton>
    </form>
  );
}

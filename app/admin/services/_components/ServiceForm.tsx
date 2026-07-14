import { upsertServiceAction } from "@/lib/actions/services";
import { SERVICE_ICON_OPTIONS } from "@/lib/content/service-icons";
import type { Service } from "@/lib/db/services";

export default function ServiceForm({ service }: { service?: Service }) {
  return (
    <form action={upsertServiceAction} className="space-y-8">
      <input type="hidden" name="originalSlug" value={service?.slug || ""} />

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">Icon</label>
          <select
            name="icon"
            defaultValue={service?.icon ?? "shield"}
            className="w-full rounded-lg border border-black/10 px-4 py-2.5"
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
            <label className="mb-1 block text-sm font-medium text-brand-dark">
              Display order
            </label>
            <input
              type="number"
              name="displayOrder"
              defaultValue={service.displayOrder ?? 0}
              className="w-full rounded-lg border border-black/10 px-4 py-2.5"
            />
            <p className="mt-1 text-xs text-brand-gray">
              Lower numbers appear first. The homepage shows the first 4.
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-4 rounded-2xl border border-black/5 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">Français</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Nom</label>
            <input
              name="name_fr"
              defaultValue={service?.fr.name}
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Accroche</label>
            <input
              name="tagline_fr"
              defaultValue={service?.fr.tagline}
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Description</label>
            <textarea
              name="description_fr"
              defaultValue={service?.fr.description}
              rows={4}
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">
              Points clés (un par ligne)
            </label>
            <textarea
              name="bullets_fr"
              defaultValue={service?.fr.bullets.join("\n")}
              rows={4}
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-black/5 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">English</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Name</label>
            <input
              name="name_en"
              defaultValue={service?.en.name}
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Tagline</label>
            <input
              name="tagline_en"
              defaultValue={service?.en.tagline}
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Description</label>
            <textarea
              name="description_en"
              defaultValue={service?.en.description}
              rows={4}
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">
              Bullet points (one per line)
            </label>
            <textarea
              name="bullets_en"
              defaultValue={service?.en.bullets.join("\n")}
              rows={4}
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
        Save service
      </button>
    </form>
  );
}

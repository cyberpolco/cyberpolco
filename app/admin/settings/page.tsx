import { getSettings } from "@/lib/db/settings";
import { updateSettingsAction } from "@/lib/actions/settings";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Settings</h1>
      <p className="mt-1 text-brand-gray">
        Edit homepage stats and social links without a redeploy.
      </p>

      <form action={updateSettingsAction} className="mt-8 space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-brand-dark">Homepage stats</h2>
          <div className="mt-4 space-y-4">
            {settings.stats.map((s, i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-black/5 p-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-gray">Value</label>
                  <input
                    name={`stat_value_${i}`}
                    defaultValue={s.value}
                    className="w-full rounded-lg border border-black/10 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-gray">Label (FR)</label>
                  <input
                    name={`stat_fr_${i}`}
                    defaultValue={s.fr}
                    className="w-full rounded-lg border border-black/10 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-brand-gray">Label (EN)</label>
                  <input
                    name={`stat_en_${i}`}
                    defaultValue={s.en}
                    className="w-full rounded-lg border border-black/10 px-3 py-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-brand-dark">Social links</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SocialField label="X (Twitter)" name="social_x" defaultValue={settings.socialLinks.x} />
            <SocialField label="LinkedIn" name="social_linkedin" defaultValue={settings.socialLinks.linkedin} />
            <SocialField label="TikTok" name="social_tiktok" defaultValue={settings.socialLinks.tiktok} />
            <SocialField label="YouTube" name="social_youtube" defaultValue={settings.socialLinks.youtube} />
            <SocialField label="GitHub" name="social_github" defaultValue={settings.socialLinks.github} />
            <SocialField
              label="WhatsApp channel"
              name="social_whatsapp"
              defaultValue={settings.socialLinks.whatsappChannel}
            />
          </div>
        </section>

        <button
          type="submit"
          className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}

function SocialField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-brand-gray">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-black/10 px-3 py-2"
      />
    </div>
  );
}

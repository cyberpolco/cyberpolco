import { requireRole } from "@/lib/auth/rbac";
import { getBlockBoth } from "@/lib/content/blocks";
import { getSettings } from "@/lib/db/settings";
import { updateFooterContentAction } from "@/lib/actions/content";
import { TextInput, TextArea, ContentSection, LocaleColumn } from "@/app/admin/cms/_components/Fields";
import BackLink from "@/app/admin/_components/BackLink";

export default async function FooterContentPage() {
  await requireRole(["super_admin", "content_editor"]);

  const [footer, { offices }] = await Promise.all([
    getBlockBoth("footer.tagline"),
    getSettings(),
  ]);

  return (
    <div>
      <BackLink href="/admin/cms" label="Back to CMS" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Footer</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Edit the tagline and office contact info shown in the footer (and on the Contact page)
        on every page. Social icons are managed under Settings.
      </p>

      <form action={updateFooterContentAction} className="mt-8 space-y-6">
        <ContentSection title="Tagline">
          <LocaleColumn label="Français">
            <TextArea name="tagline_fr" label="Texte" defaultValue={footer.fr.tagline} rows={2} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextArea name="tagline_en" label="Text" defaultValue={footer.en.tagline} rows={2} />
          </LocaleColumn>
        </ContentSection>

        <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-blue">
            Offices
          </h2>
          <div className="mt-4 space-y-6">
            {offices.map((o, i) => (
              <div key={o.country} className="rounded-xl border border-black/5 dark:border-white/10 p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextInput
                    name={`office_${i}_phone`}
                    label="Phone number"
                    defaultValue={o.phone}
                  />
                  <TextInput
                    name={`office_${i}_whatsapp`}
                    label="WhatsApp link"
                    defaultValue={o.whatsapp}
                  />
                </div>
                <div className="mt-4 grid gap-6 sm:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-brand-gray dark:text-white/60">Français</p>
                    <TextInput
                      name={`office_${i}_city_fr`}
                      label="Ville"
                      defaultValue={o.fr.city}
                    />
                    <TextInput
                      name={`office_${i}_label_fr`}
                      label="Libellé"
                      defaultValue={o.fr.label}
                    />
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-brand-gray dark:text-white/60">English</p>
                    <TextInput
                      name={`office_${i}_city_en`}
                      label="City"
                      defaultValue={o.en.city}
                    />
                    <TextInput
                      name={`office_${i}_label_en`}
                      label="Label"
                      defaultValue={o.en.label}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button
          type="submit"
          className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
        >
          Save
        </button>
      </form>
    </div>
  );
}

import { requireRole } from "@/lib/auth/rbac";
import { getBlockBoth } from "@/lib/content/blocks";
import { updatePageIntrosAction } from "@/lib/actions/content";
import { TextArea, ContentSection, LocaleColumn } from "../_components/Fields";

export default async function PageIntrosContentPage() {
  await requireRole(["super_admin", "content_editor"]);

  const [careers, contact, services] = await Promise.all([
    getBlockBoth("careers.intro"),
    getBlockBoth("contact.intro"),
    getBlockBoth("services.intro"),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Page intros</h1>
      <p className="mt-1 text-brand-gray">
        Edit the intro subtitle shown under each page&apos;s title.
      </p>

      <form action={updatePageIntrosAction} className="mt-8 space-y-6">
        <ContentSection title="Careers">
          <LocaleColumn label="Français">
            <TextArea name="careers_subtitle_fr" label="Sous-titre" defaultValue={careers.fr.subtitle} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextArea name="careers_subtitle_en" label="Subtitle" defaultValue={careers.en.subtitle} />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="Contact">
          <LocaleColumn label="Français">
            <TextArea name="contact_subtitle_fr" label="Sous-titre" defaultValue={contact.fr.subtitle} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextArea name="contact_subtitle_en" label="Subtitle" defaultValue={contact.en.subtitle} />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="Services">
          <LocaleColumn label="Français">
            <TextArea
              name="services_subtitle_fr"
              label="Sous-titre"
              defaultValue={services.fr.subtitle}
            />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextArea
              name="services_subtitle_en"
              label="Subtitle"
              defaultValue={services.en.subtitle}
            />
          </LocaleColumn>
        </ContentSection>

        <button
          type="submit"
          className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
        >
          Save page intros
        </button>
      </form>
    </div>
  );
}

import { requireRole } from "@/lib/auth/rbac";
import { getBlockBoth } from "@/lib/content/blocks";
import { updateServicesPageAction } from "@/lib/actions/content";
import { TextArea, ContentSection, LocaleColumn } from "@/app/admin/cms/_components/Fields";
import BackLink from "@/app/admin/_components/BackLink";

export default async function ServicesPageContentPage() {
  await requireRole(["super_admin", "content_editor"]);

  const intro = await getBlockBoth("services.intro");

  return (
    <div>
      <BackLink href="/admin/cms/pages" label="Back to Pages" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark">Services page</h1>
      <p className="mt-1 text-brand-gray">
        Edit the intro subtitle shown under the Services page title. Individual services are
        managed separately.
      </p>

      <form action={updateServicesPageAction} className="mt-8 space-y-6">
        <ContentSection title="Intro">
          <LocaleColumn label="Français">
            <TextArea name="subtitle_fr" label="Sous-titre" defaultValue={intro.fr.subtitle} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextArea name="subtitle_en" label="Subtitle" defaultValue={intro.en.subtitle} />
          </LocaleColumn>
        </ContentSection>

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

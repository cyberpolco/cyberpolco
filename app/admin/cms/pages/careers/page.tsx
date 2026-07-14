import { requireRole } from "@/lib/auth/rbac";
import { getBlockBoth } from "@/lib/content/blocks";
import { updateCareersPageAction } from "@/lib/actions/content";
import { TextArea, ContentSection, LocaleColumn } from "@/app/admin/cms/_components/Fields";

export default async function CareersPageContentPage() {
  await requireRole(["super_admin", "content_editor"]);

  const intro = await getBlockBoth("careers.intro");

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Careers page</h1>
      <p className="mt-1 text-brand-gray">
        Edit the intro subtitle shown under the Careers page title. Job listings are managed
        under Jobs.
      </p>

      <form action={updateCareersPageAction} className="mt-8 space-y-6">
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

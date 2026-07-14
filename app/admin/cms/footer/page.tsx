import { requireRole } from "@/lib/auth/rbac";
import { getBlockBoth } from "@/lib/content/blocks";
import { updateFooterContentAction } from "@/lib/actions/content";
import { TextArea, ContentSection, LocaleColumn } from "@/app/admin/cms/_components/Fields";

export default async function FooterContentPage() {
  await requireRole(["super_admin", "content_editor"]);

  const footer = await getBlockBoth("footer.tagline");

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Footer</h1>
      <p className="mt-1 text-brand-gray">
        Edit the tagline shown in the footer on every page. Links and social icons are managed
        under Settings.
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

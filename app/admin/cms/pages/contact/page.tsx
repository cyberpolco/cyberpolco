import { requireRole } from "@/lib/auth/rbac";
import { getBlockBoth } from "@/lib/content/blocks";
import { updateContactPageAction } from "@/lib/actions/content";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { TextArea, ContentSection, LocaleColumn } from "@/app/admin/cms/_components/Fields";
import BackLink from "@/app/admin/_components/BackLink";

export default async function ContactPageContentPage() {
  await requireRole(["super_admin", "content_editor"]);

  const intro = await getBlockBoth("contact.intro");

  return (
    <div>
      <BackLink href="/admin/cms/pages" label="Back to Pages" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Contact page</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">Edit the intro subtitle shown under the Contact page title.</p>

      <form action={updateContactPageAction} className="mt-8 space-y-6">
        <ContentSection title="Intro">
          <LocaleColumn label="Français">
            <TextArea name="subtitle_fr" label="Sous-titre" defaultValue={intro.fr.subtitle} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextArea name="subtitle_en" label="Subtitle" defaultValue={intro.en.subtitle} />
          </LocaleColumn>
        </ContentSection>

        <SubmitButton>Save</SubmitButton>
      </form>
    </div>
  );
}

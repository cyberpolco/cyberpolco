import { requireRole } from "@/lib/auth/rbac";
import { getBlockBoth } from "@/lib/content/blocks";
import { updateAboutContentAction } from "@/lib/actions/content";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { TextInput, TextArea, ContentSection, LocaleColumn } from "@/app/admin/cms/_components/Fields";
import BackLink from "@/app/admin/_components/BackLink";

export default async function AboutContentPage() {
  await requireRole(["super_admin", "content_editor"]);

  const [story, leadership, sector] = await Promise.all([
    getBlockBoth("about.story"),
    getBlockBoth("about.leadership"),
    getBlockBoth("about.sector"),
  ]);

  return (
    <div>
      <BackLink href="/admin/cms/pages" label="Back to Pages" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">About page content</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">Edit the company story, leadership bio, and sector overview.</p>

      <form action={updateAboutContentAction} className="mt-8 space-y-6">
        <ContentSection title="Our story">
          <LocaleColumn label="Français">
            <TextArea name="story_p1_fr" label="Paragraphe 1" defaultValue={story.fr.p1} />
            <TextArea name="story_p2_fr" label="Paragraphe 2" defaultValue={story.fr.p2} />
            <TextArea name="story_p3_fr" label="Paragraphe 3" defaultValue={story.fr.p3} />
            <TextInput name="story_quote_fr" label="Citation" defaultValue={story.fr.quote} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextArea name="story_p1_en" label="Paragraph 1" defaultValue={story.en.p1} />
            <TextArea name="story_p2_en" label="Paragraph 2" defaultValue={story.en.p2} />
            <TextArea name="story_p3_en" label="Paragraph 3" defaultValue={story.en.p3} />
            <TextInput name="story_quote_en" label="Quote" defaultValue={story.en.quote} />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="Leadership">
          <LocaleColumn label="Français">
            <TextInput name="leadership_name_fr" label="Nom" defaultValue={leadership.fr.name} />
            <TextInput
              name="leadership_roleTitle_fr"
              label="Fonction"
              defaultValue={leadership.fr.roleTitle}
            />
            <TextArea name="leadership_body_fr" label="Bio" defaultValue={leadership.fr.body} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextInput name="leadership_name_en" label="Name" defaultValue={leadership.en.name} />
            <TextInput
              name="leadership_roleTitle_en"
              label="Role title"
              defaultValue={leadership.en.roleTitle}
            />
            <TextArea name="leadership_body_en" label="Bio" defaultValue={leadership.en.body} />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="The sector at large">
          <LocaleColumn label="Français">
            <TextArea name="sector_body_fr" label="Texte" defaultValue={sector.fr.body} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextArea name="sector_body_en" label="Body" defaultValue={sector.en.body} />
          </LocaleColumn>
        </ContentSection>

        <SubmitButton>Save about page content</SubmitButton>
      </form>
    </div>
  );
}

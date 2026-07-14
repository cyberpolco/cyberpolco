import { requireRole } from "@/lib/auth/rbac";
import { getBlockBoth } from "@/lib/content/blocks";
import { getSettings } from "@/lib/db/settings";
import { updateHomeContentAction } from "@/lib/actions/content";
import { TextInput, TextArea, ContentSection, LocaleColumn } from "@/app/admin/cms/_components/Fields";
import BackLink from "@/app/admin/_components/BackLink";

export default async function HomeContentPage() {
  await requireRole(["super_admin", "content_editor"]);

  const [
    hero,
    mission,
    vision,
    map,
    servicesIntro,
    clientsIntro,
    statsIntro,
    articlesIntro,
    finalCta,
    { stats },
  ] = await Promise.all([
    getBlockBoth("home.hero"),
    getBlockBoth("home.mission"),
    getBlockBoth("home.vision"),
    getBlockBoth("home.map"),
    getBlockBoth("home.servicesIntro"),
    getBlockBoth("home.clientsIntro"),
    getBlockBoth("home.statsIntro"),
    getBlockBoth("home.articlesIntro"),
    getBlockBoth("home.finalCta"),
    getSettings(),
  ]);

  return (
    <div>
      <BackLink href="/admin/cms/pages" label="Back to Pages" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Homepage content</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">Edit the copy shown on the public homepage.</p>

      <form action={updateHomeContentAction} className="mt-8 space-y-6">
        <ContentSection title="Hero">
          <LocaleColumn label="Français">
            <TextInput name="hero_eyebrow_fr" label="Eyebrow" defaultValue={hero.fr.eyebrow} />
            <TextInput name="hero_heroTitle_fr" label="Titre" defaultValue={hero.fr.heroTitle} />
            <TextArea
              name="hero_heroSubtitle_fr"
              label="Sous-titre"
              defaultValue={hero.fr.heroSubtitle}
            />
            <TextInput
              name="hero_ctaPrimary_fr"
              label="Bouton principal"
              defaultValue={hero.fr.ctaPrimary}
            />
            <TextInput
              name="hero_ctaSecondary_fr"
              label="Bouton secondaire"
              defaultValue={hero.fr.ctaSecondary}
            />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextInput name="hero_eyebrow_en" label="Eyebrow" defaultValue={hero.en.eyebrow} />
            <TextInput name="hero_heroTitle_en" label="Title" defaultValue={hero.en.heroTitle} />
            <TextArea
              name="hero_heroSubtitle_en"
              label="Subtitle"
              defaultValue={hero.en.heroSubtitle}
            />
            <TextInput
              name="hero_ctaPrimary_en"
              label="Primary button"
              defaultValue={hero.en.ctaPrimary}
            />
            <TextInput
              name="hero_ctaSecondary_en"
              label="Secondary button"
              defaultValue={hero.en.ctaSecondary}
            />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="Mission">
          <LocaleColumn label="Français">
            <TextInput name="mission_title_fr" label="Titre" defaultValue={mission.fr.title} />
            <TextArea name="mission_body_fr" label="Texte" defaultValue={mission.fr.body} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextInput name="mission_title_en" label="Title" defaultValue={mission.en.title} />
            <TextArea name="mission_body_en" label="Body" defaultValue={mission.en.body} />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="Vision">
          <LocaleColumn label="Français">
            <TextInput name="vision_title_fr" label="Titre" defaultValue={vision.fr.title} />
            <TextArea name="vision_body_fr" label="Texte" defaultValue={vision.fr.body} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextInput name="vision_title_en" label="Title" defaultValue={vision.en.title} />
            <TextArea name="vision_body_en" label="Body" defaultValue={vision.en.body} />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="Africa map intro">
          <LocaleColumn label="Français">
            <TextInput name="map_title_fr" label="Titre" defaultValue={map.fr.title} />
            <TextInput name="map_subtitle_fr" label="Sous-titre" defaultValue={map.fr.subtitle} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextInput name="map_title_en" label="Title" defaultValue={map.en.title} />
            <TextInput name="map_subtitle_en" label="Subtitle" defaultValue={map.en.subtitle} />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="Services intro">
          <LocaleColumn label="Français">
            <TextInput
              name="servicesIntro_title_fr"
              label="Titre"
              defaultValue={servicesIntro.fr.title}
            />
            <TextInput
              name="servicesIntro_subtitle_fr"
              label="Sous-titre"
              defaultValue={servicesIntro.fr.subtitle}
            />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextInput
              name="servicesIntro_title_en"
              label="Title"
              defaultValue={servicesIntro.en.title}
            />
            <TextInput
              name="servicesIntro_subtitle_en"
              label="Subtitle"
              defaultValue={servicesIntro.en.subtitle}
            />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="Clients section title">
          <LocaleColumn label="Français">
            <TextInput
              name="clientsIntro_title_fr"
              label="Titre"
              defaultValue={clientsIntro.fr.title}
            />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextInput
              name="clientsIntro_title_en"
              label="Title"
              defaultValue={clientsIntro.en.title}
            />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="Stats section title">
          <LocaleColumn label="Français">
            <TextInput name="statsIntro_title_fr" label="Titre" defaultValue={statsIntro.fr.title} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextInput name="statsIntro_title_en" label="Title" defaultValue={statsIntro.en.title} />
          </LocaleColumn>
        </ContentSection>

        <section className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-blue">
            Stats numbers
          </h2>
          <div className="mt-4 space-y-4">
            {stats.map((s, i) => (
              <div
                key={i}
                className="grid gap-3 rounded-xl border border-black/5 dark:border-white/10 p-4 sm:grid-cols-3"
              >
                <TextInput name={`stat_value_${i}`} label="Value" defaultValue={s.value} />
                <TextInput name={`stat_fr_${i}`} label="Label (FR)" defaultValue={s.fr} />
                <TextInput name={`stat_en_${i}`} label="Label (EN)" defaultValue={s.en} />
              </div>
            ))}
          </div>
        </section>

        <ContentSection title="Articles intro">
          <LocaleColumn label="Français">
            <TextInput
              name="articlesIntro_title_fr"
              label="Titre"
              defaultValue={articlesIntro.fr.title}
            />
            <TextInput
              name="articlesIntro_subtitle_fr"
              label="Sous-titre"
              defaultValue={articlesIntro.fr.subtitle}
            />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextInput
              name="articlesIntro_title_en"
              label="Title"
              defaultValue={articlesIntro.en.title}
            />
            <TextInput
              name="articlesIntro_subtitle_en"
              label="Subtitle"
              defaultValue={articlesIntro.en.subtitle}
            />
          </LocaleColumn>
        </ContentSection>

        <ContentSection title="Final call to action">
          <LocaleColumn label="Français">
            <TextInput name="finalCta_title_fr" label="Titre" defaultValue={finalCta.fr.title} />
            <TextArea name="finalCta_body_fr" label="Texte" defaultValue={finalCta.fr.body} />
            <TextInput name="finalCta_button_fr" label="Bouton" defaultValue={finalCta.fr.button} />
          </LocaleColumn>
          <LocaleColumn label="English">
            <TextInput name="finalCta_title_en" label="Title" defaultValue={finalCta.en.title} />
            <TextArea name="finalCta_body_en" label="Body" defaultValue={finalCta.en.body} />
            <TextInput name="finalCta_button_en" label="Button" defaultValue={finalCta.en.button} />
          </LocaleColumn>
        </ContentSection>

        <button
          type="submit"
          className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
        >
          Save homepage content
        </button>
      </form>
    </div>
  );
}

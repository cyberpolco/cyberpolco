import { defineField, defineType } from "sanity";

function localized(name: string, blockType: string) {
  return defineField({
    name,
    type: "object",
    fields: [
      defineField({ name: "fr", title: "Français", type: blockType, validation: (r) => r.required() }),
      defineField({ name: "en", title: "English", type: blockType, validation: (r) => r.required() }),
    ],
  });
}

// Mirrors the home.* keys in lib/content/blocks.ts
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    localized("hero", "heroText"),
    localized("mission", "titleBodyText"),
    localized("vision", "titleBodyText"),
    localized("map", "titleSubtitleText"),
    localized("servicesIntro", "titleSubtitleText"),
    localized("clientsIntro", "titleOnlyText"),
    localized("statsIntro", "titleOnlyText"),
    localized("articlesIntro", "titleSubtitleText"),
    localized("finalCta", "finalCtaText"),
  ],
  preview: { prepare: () => ({ title: "Home page" }) },
});

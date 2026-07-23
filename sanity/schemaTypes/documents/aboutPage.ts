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

// Mirrors the about.* keys in lib/content/blocks.ts
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About page",
  type: "document",
  fields: [
    localized("story", "storyText"),
    localized("leadership", "leadershipText"),
    localized("sector", "bodyOnlyText"),
  ],
  preview: { prepare: () => ({ title: "About page" }) },
});

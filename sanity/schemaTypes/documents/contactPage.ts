import { defineField, defineType } from "sanity";

// Mirrors the contact.intro key in lib/content/blocks.ts
export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  fields: [
    defineField({
      name: "intro",
      type: "object",
      fields: [
        defineField({ name: "fr", title: "Français", type: "subtitleOnlyText", validation: (r) => r.required() }),
        defineField({ name: "en", title: "English", type: "subtitleOnlyText", validation: (r) => r.required() }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Contact page" }) },
});

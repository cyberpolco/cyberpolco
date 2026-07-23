import { defineField, defineType } from "sanity";

// Mirrors the footer.tagline key in lib/content/blocks.ts, plus settings.offices
// (rendered together in components/layout/Footer.tsx).
export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "document",
  fields: [
    defineField({
      name: "tagline",
      type: "object",
      fields: [
        defineField({ name: "fr", title: "Français", type: "taglineOnlyText", validation: (r) => r.required() }),
        defineField({ name: "en", title: "English", type: "taglineOnlyText", validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "offices",
      type: "array",
      of: [{ type: "officeItem" }],
    }),
  ],
  preview: { prepare: () => ({ title: "Footer" }) },
});

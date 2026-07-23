import { defineField, defineType } from "sanity";

// Mirrors the services.intro key in lib/content/blocks.ts
export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services page",
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
  preview: { prepare: () => ({ title: "Services page" }) },
});

import { defineField, defineType } from "sanity";

const ICONS = ["shield", "radar", "satellite-dish", "graduation-cap", "search-check", "layers"];

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "en.name", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      type: "string",
      options: { list: ICONS },
      validation: (r) => r.required(),
    }),
    defineField({ name: "displayOrder", type: "number", initialValue: 0 }),
    defineField({ name: "fr", title: "Français", type: "localizedServiceText", validation: (r) => r.required() }),
    defineField({ name: "en", title: "English", type: "localizedServiceText", validation: (r) => r.required() }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrderAsc",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "en.name", icon: "icon" },
    prepare({ title, icon }) {
      return { title, subtitle: icon };
    },
  },
});

import { defineField, defineType } from "sanity";

export const job = defineType({
  name: "job",
  title: "Job",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "en.title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "status",
      type: "string",
      options: { list: ["open", "closed"], layout: "radio" },
      initialValue: "open",
      validation: (r) => r.required(),
    }),
    defineField({ name: "fr", title: "Français", type: "localizedJobText", validation: (r) => r.required() }),
    defineField({ name: "en", title: "English", type: "localizedJobText", validation: (r) => r.required() }),
  ],
  preview: {
    select: { title: "en.title", location: "en.location", status: "status" },
    prepare({ title, location, status }) {
      return { title, subtitle: `${status} — ${location}` };
    },
  },
});

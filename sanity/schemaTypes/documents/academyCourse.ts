import { defineField, defineType } from "sanity";

export const academyCourse = defineType({
  name: "academyCourse",
  title: "Academy course",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "en.title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "fr", title: "Français", type: "localizedCourseText", validation: (r) => r.required() }),
    defineField({ name: "en", title: "English", type: "localizedCourseText", validation: (r) => r.required() }),
    defineField({
      name: "modules",
      type: "array",
      of: [{ type: "academyModule" }],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: { select: { title: "en.title" } },
});

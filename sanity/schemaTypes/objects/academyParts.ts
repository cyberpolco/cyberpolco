import { defineField, defineType } from "sanity";

// Mirrors AcademyLesson — not localized in the source data.
export const academyLesson = defineType({
  name: "academyLesson",
  title: "Lesson",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "material", title: "Material", type: "file" }),
  ],
  preview: { select: { title: "title" } },
});

// Mirrors AcademyModule — not localized in the source data.
export const academyModule = defineType({
  name: "academyModule",
  title: "Module",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "lessons",
      type: "array",
      of: [{ type: "academyLesson" }],
      validation: (r) => r.required().min(1),
    }),
  ],
  preview: { select: { title: "title", lessons: "lessons" } },
});

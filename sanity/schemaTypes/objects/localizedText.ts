import { defineField, defineType } from "sanity";
import { alignField } from "../lib/textAlign";

// Mirrors LocalizedArticle from lib/db/schema.ts — one of these per locale
// (fr/en), each carrying its own alignment since translations differ in length.
export const localizedArticleText = defineType({
  name: "localizedArticleText",
  title: "Article text",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "excerpt", type: "text", rows: 2, validation: (r) => r.required() }),
    alignField("excerptAlign", "Excerpt alignment"),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }],
      validation: (r) => r.required(),
    }),
    alignField("bodyAlign", "Body alignment"),
  ],
});

// Mirrors LocalizedJob
export const localizedJobText = defineType({
  name: "localizedJobText",
  title: "Job text",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "location", type: "string", validation: (r) => r.required() }),
    defineField({ name: "type", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 4, validation: (r) => r.required() }),
    alignField("descriptionAlign", "Description alignment"),
  ],
});

// Mirrors LocalizedService
export const localizedServiceText = defineType({
  name: "localizedServiceText",
  title: "Service text",
  type: "object",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "tagline", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 4, validation: (r) => r.required() }),
    alignField("descriptionAlign", "Description alignment"),
    defineField({
      name: "bullets",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.required(),
    }),
  ],
});

// Mirrors LocalizedCourseText
export const localizedCourseText = defineType({
  name: "localizedCourseText",
  title: "Course text",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "description", type: "text", rows: 3, validation: (r) => r.required() }),
  ],
});

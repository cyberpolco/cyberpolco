import { defineField, defineType } from "sanity";

export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "en.title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({ name: "date", type: "date", validation: (r) => r.required() }),
    defineField({ name: "image", type: "image" }),
    defineField({ name: "fr", title: "Français", type: "localizedArticleText", validation: (r) => r.required() }),
    defineField({ name: "en", title: "English", type: "localizedArticleText", validation: (r) => r.required() }),
    defineField({
      name: "viewCount",
      type: "number",
      readOnly: true,
      initialValue: 0,
    }),
    defineField({
      name: "shareCount",
      type: "number",
      readOnly: true,
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "en.title", date: "date", media: "image" },
    prepare({ title, date, media }) {
      return { title, subtitle: date, media };
    },
  },
});

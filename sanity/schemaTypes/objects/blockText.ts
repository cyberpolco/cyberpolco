import { defineField, defineType } from "sanity";

// Each type below mirrors a shape in lib/content/blocks.ts. One instance per
// locale (fr/en) is used on the page singleton documents.

export const heroText = defineType({
  name: "heroText",
  title: "Hero text",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", type: "string", validation: (r) => r.required() }),
    defineField({ name: "heroTitle", type: "string", validation: (r) => r.required() }),
    defineField({ name: "heroSubtitle", type: "text", rows: 3, validation: (r) => r.required() }),
    defineField({ name: "ctaPrimary", type: "string", validation: (r) => r.required() }),
    defineField({ name: "ctaSecondary", type: "string", validation: (r) => r.required() }),
  ],
});

export const titleBodyText = defineType({
  name: "titleBodyText",
  title: "Title + body text",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 4, validation: (r) => r.required() }),
  ],
});

export const titleSubtitleText = defineType({
  name: "titleSubtitleText",
  title: "Title + subtitle text",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "subtitle", type: "text", rows: 2, validation: (r) => r.required() }),
  ],
});

export const titleOnlyText = defineType({
  name: "titleOnlyText",
  title: "Title text",
  type: "object",
  fields: [defineField({ name: "title", type: "string", validation: (r) => r.required() })],
});

export const finalCtaText = defineType({
  name: "finalCtaText",
  title: "Final CTA text",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 2, validation: (r) => r.required() }),
    defineField({ name: "button", type: "string", validation: (r) => r.required() }),
  ],
});

export const storyText = defineType({
  name: "storyText",
  title: "Story text",
  type: "object",
  fields: [
    defineField({ name: "p1", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "p2", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "p3", type: "text", rows: 4, validation: (r) => r.required() }),
    defineField({ name: "quote", type: "string", validation: (r) => r.required() }),
  ],
});

export const leadershipText = defineType({
  name: "leadershipText",
  title: "Leadership text",
  type: "object",
  fields: [
    defineField({ name: "name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "roleTitle", type: "string", validation: (r) => r.required() }),
    defineField({ name: "body", type: "text", rows: 4, validation: (r) => r.required() }),
  ],
});

export const bodyOnlyText = defineType({
  name: "bodyOnlyText",
  title: "Body text",
  type: "object",
  fields: [defineField({ name: "body", type: "text", rows: 4, validation: (r) => r.required() })],
});

export const subtitleOnlyText = defineType({
  name: "subtitleOnlyText",
  title: "Subtitle text",
  type: "object",
  fields: [defineField({ name: "subtitle", type: "text", rows: 2, validation: (r) => r.required() })],
});

export const taglineOnlyText = defineType({
  name: "taglineOnlyText",
  title: "Tagline text",
  type: "object",
  fields: [defineField({ name: "tagline", type: "string", validation: (r) => r.required() })],
});

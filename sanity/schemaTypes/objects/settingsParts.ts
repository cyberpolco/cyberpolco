import { defineField, defineType } from "sanity";

// Mirrors Stat — value is shared, label is per-locale.
export const statItem = defineType({
  name: "statItem",
  title: "Stat",
  type: "object",
  fields: [
    defineField({ name: "value", type: "string", validation: (r) => r.required() }),
    defineField({ name: "fr", title: "Label (FR)", type: "string", validation: (r) => r.required() }),
    defineField({ name: "en", title: "Label (EN)", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "value", subtitle: "en" } },
});

// Mirrors Office — country/phone/whatsapp shared, city+label per-locale.
export const officeItem = defineType({
  name: "officeItem",
  title: "Office",
  type: "object",
  fields: [
    defineField({ name: "country", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "fr",
      title: "FR",
      type: "object",
      fields: [
        defineField({ name: "city", type: "string", validation: (r) => r.required() }),
        defineField({ name: "label", type: "string", validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "en",
      title: "EN",
      type: "object",
      fields: [
        defineField({ name: "city", type: "string", validation: (r) => r.required() }),
        defineField({ name: "label", type: "string", validation: (r) => r.required() }),
      ],
    }),
    defineField({ name: "phone", type: "string", validation: (r) => r.required() }),
    defineField({ name: "whatsapp", type: "string", validation: (r) => r.required() }),
  ],
  preview: { select: { title: "country" } },
});

// Mirrors SocialLinks — not localized.
export const socialLinks = defineType({
  name: "socialLinks",
  title: "Social links",
  type: "object",
  fields: [
    defineField({ name: "x", title: "X (Twitter)", type: "url" }),
    defineField({ name: "linkedin", title: "LinkedIn", type: "url" }),
    defineField({ name: "tiktok", title: "TikTok", type: "url" }),
    defineField({ name: "youtube", title: "YouTube", type: "url" }),
    defineField({ name: "github", title: "GitHub", type: "url" }),
    defineField({ name: "whatsappChannel", title: "WhatsApp channel", type: "url" }),
  ],
});

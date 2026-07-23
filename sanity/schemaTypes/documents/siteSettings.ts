import { defineField, defineType } from "sanity";

// Mirrors the settings table (minus offices, which lives on the footer
// singleton alongside the tagline it's rendered with).
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "stats", type: "array", of: [{ type: "statItem" }] }),
    defineField({ name: "socialLinks", type: "socialLinks" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

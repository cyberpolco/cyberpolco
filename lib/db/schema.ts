import { pgTable, text, boolean, jsonb, integer } from "drizzle-orm/pg-core";

type LocalizedArticle = { title: string; excerpt: string; body: string[] };
type LocalizedJob = { title: string; location: string; type: string; description: string };
type LocalizedService = { name: string; tagline: string; description: string; bullets: string[] };
type Stat = { value: string; fr: string; en: string };
type SocialLinks = {
  x: string;
  linkedin: string;
  tiktok: string;
  youtube: string;
  github: string;
  whatsappChannel: string;
};
type Office = {
  country: string;
  fr: { city: string; label: string };
  en: { city: string; label: string };
  phone: string;
  whatsapp: string;
};

export const articles = pgTable("articles", {
  slug: text("slug").primaryKey(),
  date: text("date").notNull(),
  image: text("image"),
  fr: jsonb("fr").$type<LocalizedArticle>().notNull(),
  en: jsonb("en").$type<LocalizedArticle>().notNull(),
  viewCount: integer("view_count").notNull().default(0),
  shareCount: integer("share_count").notNull().default(0),
});

export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  status: text("status", { enum: ["open", "closed"] }).notNull(),
  fr: jsonb("fr").$type<LocalizedJob>().notNull(),
  en: jsonb("en").$type<LocalizedJob>().notNull(),
  createdAt: text("created_at").notNull(),
});

export const inquiries = pgTable("inquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  position: text("position").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull(),
  read: boolean("read").notNull().default(false),
});

export const applications = pgTable("applications", {
  id: text("id").primaryKey(),
  jobSlug: text("job_slug").notNull(),
  jobTitle: text("job_title").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  message: text("message").notNull(),
  cvFileName: text("cv_file_name").notNull(),
  cvUrl: text("cv_url").notNull(),
  createdAt: text("created_at").notNull(),
  stage: text("stage", {
    enum: ["new", "reviewing", "interview", "offer", "hired", "rejected"],
  })
    .notNull()
    .default("new"),
  notes: text("notes"),
});

export const settings = pgTable("settings", {
  id: text("id").primaryKey(),
  stats: jsonb("stats").$type<Stat[]>().notNull(),
  socialLinks: jsonb("social_links").$type<SocialLinks>().notNull(),
  // Nullable (not notNull): adding a NOT NULL column to an existing row with
  // no default would fail the migration. getSettings() falls back to the
  // static defaults when this is null, same pattern as getBlock/getServices.
  offices: jsonb("offices").$type<Office[]>(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", {
    enum: ["super_admin", "content_editor", "hr_recruiter", "viewer"],
  }).notNull(),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  createdAt: text("created_at").notNull(),
  createdBy: text("created_by"),
  lastLoginAt: text("last_login_at"),
});

// Generic keyed content for one-off page sections (hero, mission, vision,
// about story, page intros, etc.) — shape varies per key, defined and
// validated in lib/content/blocks.ts, not enforced at the DB layer.
export const contentBlocks = pgTable("content_blocks", {
  key: text("key").primaryKey(),
  fr: jsonb("fr").notNull(),
  en: jsonb("en").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const services = pgTable("services", {
  slug: text("slug").primaryKey(),
  icon: text("icon", {
    enum: ["shield", "radar", "satellite-dish", "graduation-cap", "search-check", "layers"],
  }).notNull(),
  displayOrder: integer("display_order").notNull().default(0),
  fr: jsonb("fr").$type<LocalizedService>().notNull(),
  en: jsonb("en").$type<LocalizedService>().notNull(),
});

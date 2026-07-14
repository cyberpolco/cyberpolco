import { pgTable, text, boolean, jsonb } from "drizzle-orm/pg-core";

type LocalizedArticle = { title: string; excerpt: string; body: string[] };
type LocalizedJob = { title: string; location: string; type: string; description: string };
type Stat = { value: string; fr: string; en: string };
type SocialLinks = {
  x: string;
  linkedin: string;
  tiktok: string;
  youtube: string;
  github: string;
  whatsappChannel: string;
};

export const articles = pgTable("articles", {
  slug: text("slug").primaryKey(),
  date: text("date").notNull(),
  image: text("image"),
  fr: jsonb("fr").$type<LocalizedArticle>().notNull(),
  en: jsonb("en").$type<LocalizedArticle>().notNull(),
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
});

export const settings = pgTable("settings", {
  id: text("id").primaryKey(),
  stats: jsonb("stats").$type<Stat[]>().notNull(),
  socialLinks: jsonb("social_links").$type<SocialLinks>().notNull(),
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

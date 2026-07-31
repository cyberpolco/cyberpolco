import { pgTable, text, boolean, jsonb, integer } from "drizzle-orm/pg-core";
import type { TextAlign } from "@/lib/types/text-align";

type LocalizedArticle = {
  title: string;
  excerpt: string;
  excerptAlign?: TextAlign;
  body: string[];
  bodyAlign?: TextAlign;
};
type LocalizedJob = {
  title: string;
  location: string;
  type: string;
  description: string;
  descriptionAlign?: TextAlign;
};
type LocalizedService = {
  name: string;
  tagline: string;
  description: string;
  descriptionAlign?: TextAlign;
  bullets: string[];
};
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
    enum: ["super_admin", "content_editor", "hr_recruiter", "technician", "teacher", "viewer"],
  }).notNull(),
  mustChangePassword: boolean("must_change_password").notNull().default(true),
  createdAt: text("created_at").notNull(),
  createdBy: text("created_by"),
  lastLoginAt: text("last_login_at"),
  // Nullable: only set when role === "viewer" — same reasoning as
  // settings.offices above (existing rows, no default to backfill with).
  viewerType: text("viewer_type", { enum: ["starlink_client", "academy_student"] }),
  linkedId: text("linked_id"),
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

type LocalizedTeamMember = { title: string; bio: string };

export const teamMembers = pgTable("team_members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  photo: text("photo"),
  displayOrder: integer("display_order").notNull().default(0),
  fr: jsonb("fr").$type<LocalizedTeamMember>().notNull(),
  en: jsonb("en").$type<LocalizedTeamMember>().notNull(),
});

type LocalizedAchievement = { title: string; description: string };

export const achievements = pgTable("achievements", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  image1: text("image1"),
  image2: text("image2"),
  fr: jsonb("fr").$type<LocalizedAchievement>().notNull(),
  en: jsonb("en").$type<LocalizedAchievement>().notNull(),
});

type StarlinkSite = {
  id: string;
  siteName: string;
  subscriptionType: "residential" | "business" | "roam" | "250gb";
  dishType: "enterprise" | "standard" | "mini";
  installationStatus: "pending" | "scheduled" | "in_progress" | "completed";
  kitOrderRef: string;
  // Per-kit company identifier (STKYYNNNNTDDSS) — see KIT_CLIENT_ID_PATTERN.
  // Nullable: rows saved before this field existed won't have one.
  kitClientId: string | null;
  kitEmail: string;
  kitAcquisitionType: "acquired" | "leased";
  deliveryDate: string | null;
  deploymentStatus: "not_deployed" | "deployed" | "active" | "suspended";
  wifiPassword: string;
  accountPassword: string;
  paymentStatus: "paid" | "pending" | "overdue";
  subscriptionStartDate: string | null;
};

export const starlinkClients = pgTable("starlink_clients", {
  id: text("id").primaryKey(),
  clientId: text("client_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  sites: jsonb("sites").$type<StarlinkSite[]>().notNull(),
  createdAt: text("created_at").notNull(),
  // Nullable: existing rows predate this column. A null createdBy is treated
  // as "not owned by the editing technician," same as any other author
  // mismatch — see lib/auth/approval.ts.
  createdBy: text("created_by"),
});

type AcademyLesson = {
  id: string;
  title: string;
  description: string;
  materialUrl: string | null;
  materialFileName: string | null;
};
type AcademyModule = { id: string; title: string; lessons: AcademyLesson[] };
type LocalizedCourseText = { title: string; description: string };

export const academyCourses = pgTable("academy_courses", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  fr: jsonb("fr").$type<LocalizedCourseText>().notNull(),
  en: jsonb("en").$type<LocalizedCourseText>().notNull(),
  modules: jsonb("modules").$type<AcademyModule[]>().notNull(),
  createdAt: text("created_at").notNull(),
  // Nullable — see starlinkClients.createdBy above; same reasoning.
  createdBy: text("created_by"),
});

export const academyEnrollments = pgTable("academy_enrollments", {
  id: text("id").primaryKey(),
  // Not unique: a student enrolled in multiple courses has one row per
  // course, all sharing the same studentId — see getNextStudentId.
  studentId: text("student_id").notNull(),
  studentName: text("student_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  courseId: text("course_id").notNull(),
  completedLessonIds: jsonb("completed_lesson_ids").$type<string[]>().notNull(),
  certificateIssued: boolean("certificate_issued").notNull().default(false),
  certificateFileUrl: text("certificate_file_url"),
  createdAt: text("created_at").notNull(),
  // Nullable — see starlinkClients.createdBy above; same reasoning.
  createdBy: text("created_by"),
});

// A create/edit by "technician"/"teacher" to a record they didn't create
// waits here for a super_admin to approve or reject — see lib/auth/approval.ts
// for the rule and lib/actions/pending-changes.ts for the review actions.
export const pendingChanges = pgTable("pending_changes", {
  id: text("id").primaryKey(),
  targetTable: text("target_table", {
    enum: ["starlink_client", "academy_course", "academy_enrollment"],
  }).notNull(),
  targetId: text("target_id").notNull(),
  // The full proposed record, same shape the upsert action already builds —
  // applying an approval is a straight upsert of this blob, no field-level
  // diff/patch system needed.
  proposedData: jsonb("proposed_data").notNull(),
  proposedBy: text("proposed_by").notNull(),
  proposedAt: text("proposed_at").notNull(),
  status: text("status", { enum: ["pending", "approved", "rejected"] })
    .notNull()
    .default("pending"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  reviewNote: text("review_note"),
});

CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"job_slug" text NOT NULL,
	"job_title" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"message" text NOT NULL,
	"cv_file_name" text NOT NULL,
	"cv_url" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "articles" (
	"slug" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"fr" jsonb NOT NULL,
	"en" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"company" text NOT NULL,
	"position" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"created_at" text NOT NULL,
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"status" text NOT NULL,
	"fr" jsonb NOT NULL,
	"en" jsonb NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "jobs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" text PRIMARY KEY NOT NULL,
	"stats" jsonb NOT NULL,
	"social_links" jsonb NOT NULL
);

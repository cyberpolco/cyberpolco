CREATE TABLE "academy_courses" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"fr" jsonb NOT NULL,
	"en" jsonb NOT NULL,
	"modules" jsonb NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "academy_courses_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "academy_enrollments" (
	"id" text PRIMARY KEY NOT NULL,
	"student_id" text NOT NULL,
	"student_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"course_id" text NOT NULL,
	"completed_lesson_ids" jsonb NOT NULL,
	"certificate_issued" boolean DEFAULT false NOT NULL,
	"certificate_file_url" text,
	"created_at" text NOT NULL,
	CONSTRAINT "academy_enrollments_student_id_unique" UNIQUE("student_id")
);
--> statement-breakpoint
CREATE TABLE "starlink_clients" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"sites" jsonb NOT NULL,
	"created_at" text NOT NULL,
	CONSTRAINT "starlink_clients_client_id_unique" UNIQUE("client_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "viewer_type" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "linked_id" text;
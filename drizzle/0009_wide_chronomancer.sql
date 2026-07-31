CREATE TABLE "pending_changes" (
	"id" text PRIMARY KEY NOT NULL,
	"target_table" text NOT NULL,
	"target_id" text NOT NULL,
	"proposed_data" jsonb NOT NULL,
	"proposed_by" text NOT NULL,
	"proposed_at" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" text,
	"review_note" text
);
--> statement-breakpoint
ALTER TABLE "academy_courses" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "academy_enrollments" ADD COLUMN "created_by" text;--> statement-breakpoint
ALTER TABLE "starlink_clients" ADD COLUMN "created_by" text;
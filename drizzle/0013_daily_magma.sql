CREATE TABLE "academy_quiz_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"enrollment_id" text NOT NULL,
	"quiz_id" text NOT NULL,
	"answers" jsonb NOT NULL,
	"score_percent" integer NOT NULL,
	"submitted_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "academy_courses" ADD COLUMN "final_exam" jsonb;
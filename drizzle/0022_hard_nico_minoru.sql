CREATE TABLE "academy_quiz_answers" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"question_id" text NOT NULL,
	"question_type" text NOT NULL,
	"selected_option_index" integer,
	"selected_option_indexes" jsonb,
	"free_text_response" text,
	"score_percent" integer NOT NULL,
	"ai_grading_status" text DEFAULT 'not_applicable' NOT NULL,
	"ai_score_percent" integer,
	"ai_rationale" text,
	"ai_graded_at" text,
	"ai_error" text,
	"review_status" text DEFAULT 'not_applicable' NOT NULL,
	"reviewed_by" text,
	"reviewed_at" text,
	"review_note" text
);
--> statement-breakpoint
CREATE TABLE "academy_quiz_questions" (
	"id" text PRIMARY KEY NOT NULL,
	"quiz_id" text NOT NULL,
	"order" integer NOT NULL,
	"type" text NOT NULL,
	"text" text NOT NULL,
	"options" jsonb,
	"correct_option_index" integer,
	"correct_option_indexes" jsonb,
	"rubric" text,
	"model_answer" text
);
--> statement-breakpoint
ALTER TABLE "academy_quiz_submissions" ALTER COLUMN "answers" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "academy_quiz_submissions" ADD COLUMN "grading_status" text DEFAULT 'graded' NOT NULL;--> statement-breakpoint
ALTER TABLE "academy_quiz_submissions" ADD COLUMN "finalized_at" text;
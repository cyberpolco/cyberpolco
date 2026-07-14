ALTER TABLE "applications" ADD COLUMN "stage" text DEFAULT 'new' NOT NULL;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "notes" text;
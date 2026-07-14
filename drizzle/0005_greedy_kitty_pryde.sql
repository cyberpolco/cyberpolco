ALTER TABLE "articles" ADD COLUMN "view_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "articles" ADD COLUMN "share_count" integer DEFAULT 0 NOT NULL;
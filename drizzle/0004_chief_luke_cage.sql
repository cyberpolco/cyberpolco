CREATE TABLE "content_blocks" (
	"key" text PRIMARY KEY NOT NULL,
	"fr" jsonb NOT NULL,
	"en" jsonb NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"slug" text PRIMARY KEY NOT NULL,
	"icon" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"fr" jsonb NOT NULL,
	"en" jsonb NOT NULL
);

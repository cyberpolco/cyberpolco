CREATE TABLE "achievements" (
	"id" text PRIMARY KEY NOT NULL,
	"date" text NOT NULL,
	"image1" text,
	"image2" text,
	"fr" jsonb NOT NULL,
	"en" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"photo" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"fr" jsonb NOT NULL,
	"en" jsonb NOT NULL
);

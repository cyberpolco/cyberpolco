CREATE TABLE "starlink_help_history" (
	"id" text PRIMARY KEY NOT NULL,
	"client_id" text NOT NULL,
	"site_id" text NOT NULL,
	"site_name" text NOT NULL,
	"requested_at" text NOT NULL,
	"resolved_at" text NOT NULL,
	"resolved_by" text
);

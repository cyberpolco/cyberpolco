CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"must_change_password" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"created_by" text,
	"last_login_at" text,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

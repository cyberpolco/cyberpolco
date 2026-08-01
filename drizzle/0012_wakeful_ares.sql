ALTER TABLE "academy_courses" ADD COLUMN "enrollment_fee_cents" integer;--> statement-breakpoint
ALTER TABLE "academy_enrollments" ADD COLUMN "fee_paid" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "academy_enrollments" ADD COLUMN "fee_paid_at" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "starlink_pricing" jsonb;
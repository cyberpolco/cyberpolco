ALTER TABLE "academy_courses" ADD COLUMN "self_paced_fee_cents" integer;--> statement-breakpoint
ALTER TABLE "academy_courses" ADD COLUMN "classroom_fee_cents" integer;--> statement-breakpoint
ALTER TABLE "academy_enrollments" ADD COLUMN "learning_mode" text;--> statement-breakpoint
-- The single legacy enrollment fee becomes the classroom price; self-paced
-- stays unset (not offered) until a super admin prices it.
UPDATE "academy_courses" SET "classroom_fee_cents" = "enrollment_fee_cents" WHERE "enrollment_fee_cents" IS NOT NULL;--> statement-breakpoint
-- Enrollments that already paid the legacy fee paid the (now) classroom price.
UPDATE "academy_enrollments" SET "learning_mode" = 'classroom' WHERE "fee_paid" = true;

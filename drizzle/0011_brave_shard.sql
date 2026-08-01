ALTER TABLE "academy_courses" ADD COLUMN "course_id" text;--> statement-breakpoint
ALTER TABLE "academy_courses" ADD CONSTRAINT "academy_courses_course_id_unique" UNIQUE("course_id");
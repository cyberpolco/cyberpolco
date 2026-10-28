CREATE SEQUENCE "public"."academy_receipt_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 26000 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."starlink_receipt_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 26000 CACHE 1;--> statement-breakpoint
ALTER TABLE "receipts" ADD COLUMN "receipt_number" text;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_receipt_number_unique" UNIQUE("receipt_number");
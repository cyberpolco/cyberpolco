CREATE TABLE "receipts" (
	"id" text PRIMARY KEY NOT NULL,
	"reference_type" text NOT NULL,
	"reference_id" text NOT NULL,
	"pawapay_transaction_id" text,
	"source" text NOT NULL,
	"file_url" text NOT NULL,
	"file_name" text,
	"amount" text,
	"currency" text,
	"created_at" text NOT NULL,
	"created_by" text
);

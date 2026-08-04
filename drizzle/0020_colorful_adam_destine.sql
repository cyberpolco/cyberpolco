CREATE TABLE "pawapay_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"pawapay_id" text NOT NULL,
	"type" text NOT NULL,
	"status" text NOT NULL,
	"amount" text NOT NULL,
	"currency" text NOT NULL,
	"payer_msisdn" text,
	"reference_type" text,
	"reference_id" text,
	"raw_payload" jsonb NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "pawapay_transactions_pawapay_id_unique" UNIQUE("pawapay_id")
);

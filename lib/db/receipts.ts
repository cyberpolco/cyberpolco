import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "./client";
import { receipts as receiptsTable } from "./schema";
import type { PaymentReferenceType } from "./payments";

export type ReceiptSource = "auto_generated" | "staff_uploaded";

export type Receipt = {
  id: string;
  receiptNumber: string | null;
  referenceType: PaymentReferenceType;
  referenceId: string;
  pawapayTransactionId: string | null;
  source: ReceiptSource;
  fileUrl: string;
  fileName: string | null;
  amount: string | null;
  currency: string | null;
  createdAt: string;
  createdBy: string | null;
};

export async function createReceipt(input: {
  receiptNumber?: string | null;
  referenceType: PaymentReferenceType;
  referenceId: string;
  pawapayTransactionId?: string | null;
  source: ReceiptSource;
  fileUrl: string;
  fileName?: string | null;
  amount?: string | null;
  currency?: string | null;
  createdBy?: string | null;
}): Promise<void> {
  await db.insert(receiptsTable).values({
    id: crypto.randomUUID(),
    receiptNumber: input.receiptNumber ?? null,
    referenceType: input.referenceType,
    referenceId: input.referenceId,
    pawapayTransactionId: input.pawapayTransactionId ?? null,
    source: input.source,
    fileUrl: input.fileUrl,
    fileName: input.fileName ?? null,
    amount: input.amount ?? null,
    currency: input.currency ?? null,
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy ?? null,
  });
}

// Every receipt (auto-generated + staff-uploaded) for one site/enrollment,
// newest first — used by both the admin management view and the
// client/student self-service pages.
export async function getReceiptsForReference(
  referenceType: PaymentReferenceType,
  referenceId: string
): Promise<Receipt[]> {
  const rows = await db
    .select()
    .from(receiptsTable)
    .where(and(eq(receiptsTable.referenceType, referenceType), eq(receiptsTable.referenceId, referenceId)))
    .orderBy(desc(receiptsTable.createdAt));
  return rows as Receipt[];
}

// Idempotency check for generateReceiptForDeposit — the webhook and the
// status-poll fallback can both resolve the same deposit to COMPLETED.
export async function getReceiptByPawapayTransactionId(pawapayTransactionId: string): Promise<Receipt | undefined> {
  const [row] = await db
    .select()
    .from(receiptsTable)
    .where(eq(receiptsTable.pawapayTransactionId, pawapayTransactionId));
  return row as Receipt | undefined;
}

const RECEIPT_NUMBER_SEQUENCES: Record<PaymentReferenceType, { prefix: string; sequence: string }> = {
  starlink_subscription: { prefix: "REC-CPC-SL", sequence: "starlink_receipt_number_seq" },
  academy_fee: { prefix: "REC-CPC-ACAD", sequence: "academy_receipt_number_seq" },
};

// Next number in the product line's own sequence (see the sequences above
// the receipts table in schema.ts), e.g. "REC-CPC-SL-26000".
export async function nextReceiptNumber(referenceType: PaymentReferenceType): Promise<string> {
  const { prefix, sequence } = RECEIPT_NUMBER_SEQUENCES[referenceType];
  const result = await db.execute(sql`select nextval(${sequence}) as n`);
  return `${prefix}-${result.rows[0].n}`;
}

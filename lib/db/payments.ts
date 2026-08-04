import { eq } from "drizzle-orm";
import { db } from "./client";
import { pawapayTransactions as pawapayTransactionsTable } from "./schema";

export type PawaPayTransactionType = "checkout" | "deposit" | "payout" | "refund";
export type PaymentReferenceType = "starlink_subscription" | "academy_fee";

export type PawaPayTransaction = {
  id: string;
  pawapayId: string;
  type: PawaPayTransactionType;
  status: string;
  amount: string;
  currency: string;
  payerMsisdn: string | null;
  referenceType: PaymentReferenceType | null;
  referenceId: string | null;
  rawPayload: unknown;
  createdAt: string;
  updatedAt: string;
};

// Called by the future outbound-initiation code (lib/pawapay/client.ts —
// not built yet) BEFORE calling PawaPay's API, so the reference link exists
// the instant PawaPay's callback arrives, however fast that is.
export async function createPendingPawaPayTransaction(input: {
  pawapayId: string;
  type: PawaPayTransactionType;
  amount: string;
  currency: string;
  referenceType?: PaymentReferenceType | null;
  referenceId?: string | null;
}): Promise<void> {
  const now = new Date().toISOString();
  await db
    .insert(pawapayTransactionsTable)
    .values({
      id: crypto.randomUUID(),
      pawapayId: input.pawapayId,
      type: input.type,
      status: "PENDING",
      amount: input.amount,
      currency: input.currency,
      payerMsisdn: null,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      rawPayload: {},
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: pawapayTransactionsTable.pawapayId });
}

// Called by all four callback routes. PawaPay may redeliver the same
// callback for up to 15 minutes if it doesn't get a fast 2xx — upserting on
// the unique pawapayId means a duplicate delivery overwrites the same row
// rather than erroring or creating a second one. Deliberately does not
// touch referenceType/referenceId/createdAt, so it never clobbers the link
// set at pending-creation time (or leaves it null if no pending row existed
// — e.g. a sandbox test callback fired without going through our own
// initiation flow).
export async function upsertPawaPayTransaction(input: {
  pawapayId: string;
  type: PawaPayTransactionType;
  status: string;
  amount: string;
  currency: string;
  payerMsisdn?: string | null;
  rawPayload: unknown;
}): Promise<void> {
  const now = new Date().toISOString();
  await db
    .insert(pawapayTransactionsTable)
    .values({
      id: crypto.randomUUID(),
      pawapayId: input.pawapayId,
      type: input.type,
      status: input.status,
      amount: input.amount,
      currency: input.currency,
      payerMsisdn: input.payerMsisdn ?? null,
      referenceType: null,
      referenceId: null,
      rawPayload: input.rawPayload,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: pawapayTransactionsTable.pawapayId,
      set: {
        status: input.status,
        amount: input.amount,
        currency: input.currency,
        payerMsisdn: input.payerMsisdn ?? null,
        rawPayload: input.rawPayload,
        updatedAt: now,
      },
    });
}

export async function getPawaPayTransactionByPawaPayId(
  pawapayId: string
): Promise<PawaPayTransaction | undefined> {
  const [row] = await db
    .select()
    .from(pawapayTransactionsTable)
    .where(eq(pawapayTransactionsTable.pawapayId, pawapayId));
  return row as PawaPayTransaction | undefined;
}

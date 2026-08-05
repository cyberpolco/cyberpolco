import { and, desc, eq } from "drizzle-orm";
import { db } from "./client";
import { pawapayTransactions as pawapayTransactionsTable } from "./schema";
import { monthlyTrend } from "@/lib/utils/monthly-trend";

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
  payerMsisdn?: string | null;
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
      payerMsisdn: input.payerMsisdn ?? null,
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

// Called both by the synchronous REJECTED/DUPLICATE_IGNORED response from
// initiateDeposit (PawaPay never sends a callback for those, see
// lib/pawapay/client.ts) and by the status-poll fallback (for when the
// webhook is delayed or can't reach a local dev server at all).
// payerMsisdn is optional (undefined) rather than defaulting to null so
// callers without fresh payer data — e.g. the synchronous REJECTED/FAILED
// paths in lib/actions/{starlink,academy}.ts — don't clobber a value set
// earlier by the webhook callback.
export async function markPawaPayTransactionStatus(
  pawapayId: string,
  status: string,
  rawPayload: unknown = {},
  payerMsisdn?: string | null
): Promise<void> {
  await db
    .update(pawapayTransactionsTable)
    .set({
      status,
      rawPayload,
      updatedAt: new Date().toISOString(),
      ...(payerMsisdn !== undefined ? { payerMsisdn } : {}),
    })
    .where(eq(pawapayTransactionsTable.pawapayId, pawapayId));
}

// Most recent transaction for a given domain object — lets a page show
// "payment pending" for a site/enrollment that already has a deposit in
// flight, without needing a dedicated "pending payment" column on that
// domain table.
export async function getLatestPawaPayTransactionForReference(
  referenceType: PaymentReferenceType,
  referenceId: string
): Promise<PawaPayTransaction | undefined> {
  const [row] = await db
    .select()
    .from(pawapayTransactionsTable)
    .where(
      and(
        eq(pawapayTransactionsTable.referenceType, referenceType),
        eq(pawapayTransactionsTable.referenceId, referenceId)
      )
    )
    .orderBy(desc(pawapayTransactionsTable.createdAt))
    .limit(1);
  return row as PawaPayTransaction | undefined;
}

// Full history (not just the latest) for one client/enrollment's "my
// payment history" section.
export async function getPawaPayTransactionsForReference(
  referenceType: PaymentReferenceType,
  referenceId: string
): Promise<PawaPayTransaction[]> {
  const rows = await db
    .select()
    .from(pawapayTransactionsTable)
    .where(
      and(
        eq(pawapayTransactionsTable.referenceType, referenceType),
        eq(pawapayTransactionsTable.referenceId, referenceId)
      )
    )
    .orderBy(desc(pawapayTransactionsTable.createdAt));
  return rows as PawaPayTransaction[];
}

// No pagination, matching every other admin list page in this app (fetch
// everything, filter client-side) — see app/admin/users/_components/UsersTable.tsx.
export async function getAllPawaPayTransactions(): Promise<PawaPayTransaction[]> {
  const rows = await db
    .select()
    .from(pawapayTransactionsTable)
    .orderBy(desc(pawapayTransactionsTable.createdAt));
  return rows as PawaPayTransaction[];
}

const COMPLETED_STATUSES = new Set(["COMPLETED"]);
const IN_PROGRESS_STATUSES = new Set(["PENDING", "ACCEPTED", "PROCESSING", "IN_RECONCILIATION"]);
const FAILED_STATUSES = new Set(["FAILED", "REJECTED"]);

export type PaymentsStats = {
  totalCount: number;
  totalCollectedLabel: string;
  byStatus: { label: string; value: number; tone: "good" | "warning" | "critical" }[];
  /** Dollars collected (COMPLETED only) per product, not a transaction count. */
  byProduct: { label: string; value: number }[];
  perMonth: { label: string; value: number }[];
};

function referenceProductLabel(referenceType: PaymentReferenceType | null): string {
  if (referenceType === "starlink_subscription") return "Starlink";
  if (referenceType === "academy_fee") return "Academy";
  return "Unlinked";
}

// Rounds away float-accumulation noise (e.g. repeated 0.1 + 0.2 additions)
// before a dollar sum ever reaches the UI.
function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function computePaymentsStats(transactions: PawaPayTransaction[]): PaymentsStats {
  const completed = transactions.filter((t) => COMPLETED_STATUSES.has(t.status));
  const totalCollected = roundCents(completed.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0));

  const products: (PaymentReferenceType | null)[] = ["starlink_subscription", "academy_fee", null];

  return {
    totalCount: transactions.length,
    totalCollectedLabel: `$${totalCollected.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    byStatus: [
      { label: "Completed", value: completed.length, tone: "good" },
      { label: "In progress", value: transactions.filter((t) => IN_PROGRESS_STATUSES.has(t.status)).length, tone: "warning" },
      { label: "Failed", value: transactions.filter((t) => FAILED_STATUSES.has(t.status)).length, tone: "critical" },
    ],
    byProduct: products.map((p) => ({
      label: referenceProductLabel(p),
      value: roundCents(
        completed.filter((t) => t.referenceType === p).reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0)
      ),
    })),
    perMonth: monthlyTrend(completed, 12, undefined, (t) => parseFloat(t.amount) || 0).map((m) => ({
      ...m,
      value: roundCents(m.value),
    })),
  };
}

export async function getPaymentsStats(scope?: PaymentReferenceType): Promise<PaymentsStats> {
  const all = await getAllPawaPayTransactions();
  const scoped = scope ? all.filter((t) => t.referenceType === scope) : all;
  return computePaymentsStats(scoped);
}

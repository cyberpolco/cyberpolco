import { markStarlinkSiteSubscriptionPaid } from "@/lib/db/starlink";
import { markEnrollmentFeePaid } from "@/lib/db/academy";
import { getPawaPayTransactionByPawaPayId, markPawaPayTransactionStatus, type PawaPayTransaction } from "@/lib/db/payments";
import { generateReceiptForDeposit } from "@/lib/receipts/generate";

// The fields applyDepositOutcome/generateReceiptForDeposit actually need —
// narrower than the full PawaPayTransaction row so callers building a
// partial/mocked transaction (tests) aren't forced to fill in every column.
export type DepositTransaction = Pick<
  PawaPayTransaction,
  "id" | "pawapayId" | "referenceType" | "referenceId" | "amount" | "currency"
>;

// Applies the domain-level effect of a deposit reaching a final status.
// Called from both the webhook callback handler and each feature's
// status-poll fallback (see lib/actions/starlink.ts, lib/actions/academy.ts)
// — a payment resolves the same way regardless of which one notices first,
// and both paths are idempotent. Takes the full transaction (not just
// referenceType/referenceId) so it can also generate a receipt from the
// same amount/currency/pawapayId, all in this one choke point.
export async function applyDepositOutcome(transaction: DepositTransaction, status: string): Promise<void> {
  if (status !== "COMPLETED" || !transaction.referenceType || !transaction.referenceId) return;

  if (transaction.referenceType === "starlink_subscription") {
    await markStarlinkSiteSubscriptionPaid(transaction.referenceId);
  } else if (transaction.referenceType === "academy_fee") {
    await markEnrollmentFeePaid(transaction.referenceId);
  }

  // A receipt is a nice-to-have — never allowed to block "the payment was
  // marked paid" above, which already succeeded.
  try {
    await generateReceiptForDeposit(transaction);
  } catch (err) {
    console.error("Failed to auto-generate receipt for deposit:", err);
  }
}

// Super-admin-only escape hatch for a transaction that's stuck (webhook lost
// and the status-poll fallback also never resolved it) — forces the same
// outcome a real webhook/poll would have applied, via applyDepositOutcome,
// so a manual override behaves identically to the automatic path. The
// override is recorded in rawPayload for audit purposes; it never overwrites
// whatever PawaPay itself last reported there.
export async function manuallyReconcileDeposit(
  pawapayId: string,
  outcome: "COMPLETED" | "FAILED",
  actor: { userId: string }
): Promise<void> {
  const transaction = await getPawaPayTransactionByPawaPayId(pawapayId);
  if (!transaction) return;

  const rawPayload = {
    ...(typeof transaction.rawPayload === "object" && transaction.rawPayload ? transaction.rawPayload : {}),
    manualReconciliation: { by: actor.userId, at: new Date().toISOString(), outcome },
  };
  await markPawaPayTransactionStatus(pawapayId, outcome, rawPayload);

  if (outcome === "COMPLETED") {
    await applyDepositOutcome(transaction, "COMPLETED");
  }
}

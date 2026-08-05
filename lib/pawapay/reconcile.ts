import { markStarlinkSiteSubscriptionPaid } from "@/lib/db/starlink";
import { markEnrollmentFeePaid } from "@/lib/db/academy";
import {
  getPawaPayTransactionByPawaPayId,
  markPawaPayTransactionStatus,
  type PaymentReferenceType,
} from "@/lib/db/payments";

// Applies the domain-level effect of a deposit reaching a final status.
// Called from both the webhook callback handler and each feature's
// status-poll fallback (see lib/actions/starlink.ts, lib/actions/academy.ts)
// — a payment resolves the same way regardless of which one notices first,
// and both paths are idempotent.
export async function applyDepositOutcome(
  referenceType: PaymentReferenceType | null | undefined,
  referenceId: string | null | undefined,
  status: string
): Promise<void> {
  if (status !== "COMPLETED" || !referenceType || !referenceId) return;

  if (referenceType === "starlink_subscription") {
    await markStarlinkSiteSubscriptionPaid(referenceId);
  } else if (referenceType === "academy_fee") {
    await markEnrollmentFeePaid(referenceId);
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
    await applyDepositOutcome(transaction.referenceType, transaction.referenceId, "COMPLETED");
  }
}

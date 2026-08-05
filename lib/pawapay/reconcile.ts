import { markStarlinkSiteSubscriptionPaid } from "@/lib/db/starlink";
import { markEnrollmentFeePaid } from "@/lib/db/academy";
import type { PaymentReferenceType } from "@/lib/db/payments";

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

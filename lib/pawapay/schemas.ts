import { z } from "zod";

// .passthrough() so unmodeled fields still make it into rawPayload (see
// lib/db/payments.ts) regardless of what gets parsed into typed columns here.
const baseCallback = z.object({ status: z.string() }).passthrough();

// Confirmed against https://docs.pawapay.io/v2/api-reference/deposits
// (same payload shape as the check-deposit-status response). Deposit
// callbacks fire once the deposit reaches a final status: COMPLETED or
// FAILED — this schema stays loose on `status` in case PawaPay ever adds a
// value we haven't seen (ACCEPTED/PROCESSING/IN_RECONCILIATION are the
// other known values, but only apply to the request/poll responses).
export const pawapayDepositCallbackSchema = baseCallback.extend({
  depositId: z.string(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  payer: z
    .object({
      type: z.literal("MMO"),
      accountDetails: z.object({ phoneNumber: z.string(), provider: z.string() }),
    })
    .optional(),
  providerTransactionId: z.string().optional(),
  failureReason: z.object({ failureCode: z.string(), failureMessage: z.string() }).optional(),
});

// PLACEHOLDER FIELD NAMES — no confirmed PawaPay docs found for a distinct
// "checkout" callback (the hosted Payment Page still resolves to a plain
// deposit under the hood). Verify in the PawaPay sandbox dashboard whether
// this callback type is real before relying on it.
export const pawapayCheckoutCallbackSchema = baseCallback.extend({
  checkoutId: z.string(),
  amount: z.string().optional(),
  currency: z.string().optional(),
});

// PLACEHOLDER FIELD NAMES — confirm against PawaPay's payout callback docs
// before relying on this; not yet cross-checked like the deposit schema above.
export const pawapayPayoutCallbackSchema = baseCallback.extend({
  payoutId: z.string(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  recipient: z.object({ address: z.object({ value: z.string() }).optional() }).optional(),
});

// PLACEHOLDER FIELD NAMES — confirm against PawaPay's refund callback docs
// before relying on this; not yet cross-checked like the deposit schema above.
export const pawapayRefundCallbackSchema = baseCallback.extend({
  refundId: z.string(),
  amount: z.string().optional(),
  currency: z.string().optional(),
});

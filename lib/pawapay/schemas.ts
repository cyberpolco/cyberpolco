import { z } from "zod";

// PLACEHOLDER FIELD NAMES — confirm against PawaPay's callback payload docs
// once the API token/dashboard exists. .passthrough() so unmodeled fields
// still make it into rawPayload (see lib/db/payments.ts) regardless of what
// gets parsed into typed columns here.
const baseCallback = z.object({ status: z.string() }).passthrough();

export const pawapayCheckoutCallbackSchema = baseCallback.extend({
  checkoutId: z.string(),
  amount: z.string().optional(),
  currency: z.string().optional(),
});

export const pawapayDepositCallbackSchema = baseCallback.extend({
  depositId: z.string(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  payer: z.object({ address: z.object({ value: z.string() }).optional() }).optional(),
});

export const pawapayPayoutCallbackSchema = baseCallback.extend({
  payoutId: z.string(),
  amount: z.string().optional(),
  currency: z.string().optional(),
  recipient: z.object({ address: z.object({ value: z.string() }).optional() }).optional(),
});

export const pawapayRefundCallbackSchema = baseCallback.extend({
  refundId: z.string(),
  amount: z.string().optional(),
  currency: z.string().optional(),
});

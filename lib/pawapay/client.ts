import { z } from "zod";
import { createHash, createPrivateKey, createSign } from "crypto";
import { httpbis, type SigningKey } from "http-message-signatures";

/**
 * Outbound PawaPay client — initiates deposits and polls their status.
 *
 * Confirmed against https://docs.pawapay.io/v2/api-reference/deposits
 * (initiate-deposit, check-deposit-status). Request signing (RFC-9421,
 * per https://docs.pawapay.io/v2/docs/signatures) is only applied when
 * PAWAPAY_SIGNING_KEY_ID/PAWAPAY_SIGNING_PRIVATE_KEY are set — PawaPay
 * enforces it per-account via a dashboard toggle, so unsigned requests
 * are rejected with HTTP 401 HTTP_SIGNATURE_ERROR once that's turned on.
 */

const SANDBOX_BASE_URL = "https://api.sandbox.pawapay.io";

function getBaseUrl(): string {
  return process.env.PAWAPAY_BASE_URL || SANDBOX_BASE_URL;
}

function getApiKey(): string {
  const key = process.env.PAWAPAY_API_KEY;
  if (!key) {
    throw new Error("PAWAPAY_API_KEY is not set. Add it to your environment variables (see .env.example).");
  }
  return key;
}

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getApiKey()}`,
  };
}

function getSigningKey(): SigningKey | null {
  const keyId = process.env.PAWAPAY_SIGNING_KEY_ID;
  const privateKeyPem = process.env.PAWAPAY_SIGNING_PRIVATE_KEY;
  if (!keyId || !privateKeyPem) {
    return null;
  }
  const privateKey = createPrivateKey(privateKeyPem);
  return {
    id: keyId,
    alg: "ecdsa-p256-sha256",
    async sign(data: Buffer) {
      return createSign("SHA256").update(data).sign(privateKey);
    },
  };
}

// Adds RFC-9421 Signature/Signature-Input headers when signing is
// configured; otherwise returns just the digest/date headers PawaPay's
// signature base would have covered, matching pre-signing behavior.
async function signedRequestHeaders(url: string, method: string, body?: string): Promise<Record<string, string>> {
  const signatureDate = new Date().toISOString();
  const headers: Record<string, string> = { "Signature-Date": signatureDate };
  const fields = ["@method", "@authority", "@path", "signature-date"];

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    headers["Content-Digest"] = `sha-512=:${createHash("sha512").update(body).digest("base64")}:`;
    headers["Content-Length"] = String(Buffer.byteLength(body));
    fields.push("content-digest", "content-type", "content-length");
  }

  const key = getSigningKey();
  if (!key) {
    return headers;
  }
  const signed = await httpbis.signMessage({ key, name: "sig-pp", fields }, { method, url, headers });
  return signed.headers as Record<string, string>;
}

const predictProviderResponseSchema = z.object({
  country: z.string(),
  provider: z.string(),
  phoneNumber: z.string(),
});

export type PredictProviderResult = z.infer<typeof predictProviderResponseSchema>;

// Sanitizes a customer-entered phone number and predicts which mobile money
// provider it belongs to, so callers don't need their own country/provider
// picker UI. https://docs.pawapay.io/v2/api-reference/toolkit/predict-provider
export async function predictProvider(phoneNumber: string): Promise<PredictProviderResult> {
  const url = `${getBaseUrl()}/v2/predict-provider`;
  const body = JSON.stringify({ phoneNumber });
  const res = await fetch(url, {
    method: "POST",
    headers: { ...authHeaders(), ...(await signedRequestHeaders(url, "POST", body)) },
    cache: "no-store",
    body,
  });

  if (!res.ok) {
    throw new Error(`PawaPay predict provider failed with HTTP ${res.status}: ${await res.text()}`);
  }

  const parsed = predictProviderResponseSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(`PawaPay predict provider returned an unexpected response shape: ${parsed.error.message}`);
  }
  return parsed.data;
}

const failureReasonSchema = z.object({
  failureCode: z.string(),
  failureMessage: z.string(),
});

const payerSchema = z.object({
  type: z.literal("MMO"),
  accountDetails: z.object({
    phoneNumber: z.string(),
    provider: z.string(),
  }),
});

export type PawaPayFailureReason = z.infer<typeof failureReasonSchema>;

export type InitiateDepositInput = {
  depositId: string;
  phoneNumber: string;
  provider: string;
  amount: string;
  currency: string;
  clientReferenceId?: string;
  /** 4-22 chars, shown to the customer on their phone as the transaction narration. */
  customerMessage?: string;
};

export type InitiateDepositResult =
  | { status: "ACCEPTED"; depositId: string; created?: string }
  | { status: "DUPLICATE_IGNORED"; depositId: string }
  | { status: "REJECTED"; depositId: string; failureReason?: PawaPayFailureReason };

const initiateDepositResponseSchema = z.object({
  depositId: z.string(),
  status: z.enum(["ACCEPTED", "REJECTED", "DUPLICATE_IGNORED"]),
  created: z.string().optional(),
  failureReason: failureReasonSchema.optional(),
});

// Synchronous accept/reject only — the actual payment outcome (COMPLETED/
// FAILED) arrives later via the /api/pawapay/deposits/callback webhook, or
// checkDepositStatus() below as a fallback.
export async function initiateDeposit(input: InitiateDepositInput): Promise<InitiateDepositResult> {
  const url = `${getBaseUrl()}/v2/deposits`;
  const body = JSON.stringify({
    depositId: input.depositId,
    payer: {
      type: "MMO",
      accountDetails: { phoneNumber: input.phoneNumber, provider: input.provider },
    },
    amount: input.amount,
    currency: input.currency,
    ...(input.clientReferenceId ? { clientReferenceId: input.clientReferenceId } : {}),
    ...(input.customerMessage ? { customerMessage: input.customerMessage } : {}),
  });
  const res = await fetch(url, {
    method: "POST",
    headers: { ...authHeaders(), ...(await signedRequestHeaders(url, "POST", body)) },
    cache: "no-store",
    body,
  });

  if (!res.ok) {
    throw new Error(`PawaPay initiate deposit failed with HTTP ${res.status}: ${await res.text()}`);
  }

  const parsed = initiateDepositResponseSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(`PawaPay initiate deposit returned an unexpected response shape: ${parsed.error.message}`);
  }

  const data = parsed.data;
  if (data.status === "REJECTED") {
    return { status: "REJECTED", depositId: data.depositId, failureReason: data.failureReason };
  }
  return { status: data.status, depositId: data.depositId, created: data.created };
}

const depositSchema = z.object({
  depositId: z.string(),
  status: z.enum(["ACCEPTED", "PROCESSING", "IN_RECONCILIATION", "COMPLETED", "FAILED"]),
  amount: z.string(),
  currency: z.string(),
  country: z.string().optional(),
  payer: payerSchema.optional(),
  providerTransactionId: z.string().optional(),
  clientReferenceId: z.string().optional(),
  customerMessage: z.string().optional(),
  created: z.string().optional(),
  failureReason: failureReasonSchema.optional(),
});

export type PawaPayDeposit = z.infer<typeof depositSchema>;

export type CheckDepositStatusResult = { found: true; deposit: PawaPayDeposit } | { found: false };

const checkDepositStatusResponseSchema = z.discriminatedUnion("status", [
  z.object({ status: z.literal("FOUND"), data: depositSchema }),
  z.object({ status: z.literal("NOT_FOUND") }),
]);

// Fallback for when the webhook callback is delayed or lost — PawaPay's own
// guidance is to confirm final status via callback OR by polling this.
export async function checkDepositStatus(depositId: string): Promise<CheckDepositStatusResult> {
  const url = `${getBaseUrl()}/v2/deposits/${depositId}`;
  const res = await fetch(url, {
    method: "GET",
    headers: { ...authHeaders(), ...(await signedRequestHeaders(url, "GET")) },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PawaPay check deposit status failed with HTTP ${res.status}: ${await res.text()}`);
  }

  const parsed = checkDepositStatusResponseSchema.safeParse(await res.json());
  if (!parsed.success) {
    throw new Error(`PawaPay check deposit status returned an unexpected response shape: ${parsed.error.message}`);
  }

  return parsed.data.status === "FOUND" ? { found: true, deposit: parsed.data.data } : { found: false };
}

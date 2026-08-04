import { NextRequest, NextResponse } from "next/server";
import type { ZodType } from "zod";
import { verifyPawaPayCallback } from "./verify";
import { upsertPawaPayTransaction, type PawaPayTransactionType } from "@/lib/db/payments";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Extracts the type-specific id field (checkoutId/depositId/payoutId/
// refundId) into a common shape. Field names are placeholders — see
// lib/pawapay/schemas.ts.
const ID_FIELD: Record<PawaPayTransactionType, string> = {
  checkout: "checkoutId",
  deposit: "depositId",
  payout: "payoutId",
  refund: "refundId",
};

// Generous relative to the contact/apply forms' 5/min — this is a
// server-to-server webhook, not a human filling out a form, so a burst of
// legitimate callbacks (several payments settling at once) shouldn't get
// throttled. Still bounded, unlike before, so anonymous flooding of an
// unauthenticated request is no longer free.
const RATE_LIMIT_PER_MINUTE = 30;

export async function handlePawaPayCallback(
  req: NextRequest,
  type: PawaPayTransactionType,
  schema: ZodType
): Promise<NextResponse> {
  const ip = getClientIp(req.headers);
  const rate = await checkRateLimit(`pawapay:${type}:${ip}`, RATE_LIMIT_PER_MINUTE, 60_000);
  if (!rate.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const rawBody = await req.text();

  if (!verifyPawaPayCallback(req, rawBody)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error(`Invalid PawaPay ${type} callback payload:`, parsed.error.flatten());
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data as Record<string, unknown>;
  const pawapayId = data[ID_FIELD[type]] as string;

  try {
    await upsertPawaPayTransaction({
      pawapayId,
      type,
      status: data.status as string,
      amount: (data.amount as string) ?? "0",
      currency: (data.currency as string) ?? "",
      // TODO: pull from data.payer/data.recipient once field shape is confirmed.
      payerMsisdn: null,
      rawPayload: body,
    });
  } catch (err) {
    console.error(`Failed to persist PawaPay ${type} callback:`, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

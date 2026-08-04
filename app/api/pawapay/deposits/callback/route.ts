import { NextRequest } from "next/server";
import { handlePawaPayCallback } from "@/lib/pawapay/callback-handler";
import { pawapayDepositCallbackSchema } from "@/lib/pawapay/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handlePawaPayCallback(req, "deposit", pawapayDepositCallbackSchema);
}

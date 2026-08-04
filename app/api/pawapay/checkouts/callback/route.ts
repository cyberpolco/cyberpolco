import { NextRequest } from "next/server";
import { handlePawaPayCallback } from "@/lib/pawapay/callback-handler";
import { pawapayCheckoutCallbackSchema } from "@/lib/pawapay/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  return handlePawaPayCallback(req, "checkout", pawapayCheckoutCallbackSchema);
}

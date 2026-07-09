"use server";

import { revalidatePath } from "next/cache";
import { markInquiryRead } from "@/lib/db/inquiries";

export async function toggleInquiryReadAction(formData: FormData) {
  const id = String(formData.get("id") || "");
  const nextState = String(formData.get("nextState") || "true") === "true";
  await markInquiryRead(id, nextState);
  revalidatePath("/admin/inquiries");
}

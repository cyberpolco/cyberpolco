"use server";

import { revalidatePath } from "next/cache";
import { markInquiryRead } from "@/lib/db/inquiries";
import { requireRole } from "@/lib/auth/rbac";

export async function toggleInquiryReadAction(formData: FormData) {
  await requireRole(["super_admin"]);

  const id = String(formData.get("id") || "");
  const nextState = String(formData.get("nextState") || "true") === "true";
  await markInquiryRead(id, nextState);
  revalidatePath("/admin/inquiries");
}

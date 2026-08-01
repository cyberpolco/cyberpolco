"use server";

import { revalidatePath } from "next/cache";
import { markInquiryRead, deleteInquiry } from "@/lib/db/inquiries";
import { requireRole } from "@/lib/auth/rbac";

export async function toggleInquiryReadAction(formData: FormData) {
  await requireRole(["super_admin", "hr_recruiter", "technician", "teacher"]);

  const id = String(formData.get("id") || "");
  const nextState = String(formData.get("nextState") || "true") === "true";
  await markInquiryRead(id, nextState);
  revalidatePath("/admin/inquiries");
}

export async function deleteInquiryAction(formData: FormData) {
  await requireRole(["super_admin"]);

  const id = String(formData.get("id") || "");
  await deleteInquiry(id);
  revalidatePath("/admin/inquiries");
}

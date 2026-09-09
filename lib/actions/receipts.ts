"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { createReceipt } from "@/lib/db/receipts";
import type { PaymentReferenceType } from "@/lib/db/payments";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "");
}

// Staff/superadmin attaching a receipt PDF to a Starlink site or Academy
// enrollment — no approval-queue step (unlike editing a starlink_client or
// academy_enrollment record itself): this only adds a new receipts row, it
// never mutates an owned business record, so it's closer to the
// certificate-upload precedent (StudentProgressForm) than to a client edit.
export async function uploadReceiptAction(formData: FormData): Promise<void> {
  const session = await requireRole(["super_admin", "technician", "teacher"]);

  const referenceType = field(formData, "referenceType") as PaymentReferenceType;
  const referenceId = field(formData, "referenceId");
  const fileUrl = field(formData, "fileUrl");
  const fileName = field(formData, "fileName") || null;
  if (!fileUrl || !referenceId) return;

  // Same scoping as Financial Transactions
  // (app/admin/financial-transactions/page.tsx): technician manages Starlink
  // only, teacher manages Academy only, super_admin manages both.
  if (session.role === "technician" && referenceType !== "starlink_subscription") {
    throw new Error("Not authorized.");
  }
  if (session.role === "teacher" && referenceType !== "academy_fee") {
    throw new Error("Not authorized.");
  }

  await createReceipt({
    referenceType,
    referenceId,
    pawapayTransactionId: null,
    source: "staff_uploaded",
    fileUrl,
    fileName,
    amount: null,
    currency: null,
    createdBy: session.userId,
  });

  // Redirects back to the same page (rather than just revalidating) so the
  // upload widget's client-side file-picker state resets — same pattern as
  // updateEnrollmentProgressAction (lib/actions/academy.ts).
  if (referenceType === "starlink_subscription") {
    const path = `/admin/starlink/${field(formData, "clientId")}/edit`;
    revalidatePath(path);
    redirect(path);
  } else {
    const path = `/admin/academy/students/${referenceId}`;
    revalidatePath(path);
    redirect(path);
  }
}

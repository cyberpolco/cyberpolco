"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { manuallyReconcileDeposit } from "@/lib/pawapay/reconcile";

export async function reconcileTransactionAction(formData: FormData): Promise<void> {
  const session = await requireRole(["super_admin"]);

  const pawapayId = String(formData.get("pawapayId") || "");
  const outcome = String(formData.get("outcome") || "");
  if (!pawapayId || (outcome !== "COMPLETED" && outcome !== "FAILED")) return;

  await manuallyReconcileDeposit(pawapayId, outcome, { userId: session.userId });
  revalidatePath("/admin/financial-transactions");
}

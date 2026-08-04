"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import { getUserById, updateUserPhone } from "@/lib/db/users";
import { canUpdatePhone } from "@/lib/auth/phone-cooldown";
import { phoneInputSchema, composePhone } from "@/lib/validation/phone";

export async function updatePhoneAction(formData: FormData) {
  const session = await requireRole(["technician"]);

  const user = await getUserById(session.userId);
  if (!user) redirect("/admin/login");

  // Never trust the client's rendering of the cooldown — re-check here.
  if (!canUpdatePhone(user.phoneUpdatedAt, new Date())) {
    redirect("/admin/my-phone?error=cooldown");
  }

  const parsed = phoneInputSchema.safeParse({
    countryCode: formData.get("countryCode"),
    localNumber: formData.get("localNumber"),
  });
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    redirect(`/admin/my-phone?error=${field === "countryCode" ? "country-code" : "local-number"}`);
  }

  const phone = composePhone(parsed.data.countryCode, parsed.data.localNumber);
  await updateUserPhone(user.id, phone, new Date().toISOString());
  revalidatePath("/admin/my-phone");
  redirect("/admin/my-phone?success=1");
}

import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/rbac";
import { getUserById } from "@/lib/db/users";
import { canUpdatePhone, nextPhoneUpdateDate } from "@/lib/auth/phone-cooldown";
import { formatDate } from "@/lib/utils/date-format";
import UpdatePhoneForm from "./_components/UpdatePhoneForm";

export default async function MyPhonePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const session = await getSession();
  if (session?.role !== "technician") redirect("/admin/dashboard");
  const { error, success } = await searchParams;

  const user = await getUserById(session.userId);
  const now = new Date();
  const editable = canUpdatePhone(user?.phoneUpdatedAt ?? null, now);
  const unlockDate = editable ? null : nextPhoneUpdateDate(user?.phoneUpdatedAt ?? null);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">My Phone Number</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Current: {user?.phone ?? "Not set yet"}
      </p>

      {editable ? (
        <UpdatePhoneForm error={error} success={success} />
      ) : (
        <p className="mt-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          You can update your phone number again on {unlockDate ? formatDate(unlockDate) : ""}.
        </p>
      )}
    </div>
  );
}

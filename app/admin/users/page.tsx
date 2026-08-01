import Link from "next/link";
import { Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { getUsers } from "@/lib/db/users";
import ErrorToast from "@/app/admin/_components/ErrorToast";
import UsersTable from "@/app/admin/users/_components/UsersTable";

const ERROR_MESSAGES: Record<string, string> = {
  "self-delete": "You can't delete your own account.",
  "last-super-admin": "You can't remove the last remaining Super Admin.",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await requireRole(["super_admin"]);
  const { error } = await searchParams;
  const users = await getUsers();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Users</h1>
        <Link
          href="/admin/users/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New user
        </Link>
      </div>

      {error && ERROR_MESSAGES[error] && (
        <p className="mt-4 text-sm text-brand-red">{ERROR_MESSAGES[error]}</p>
      )}
      <ErrorToast message={error ? ERROR_MESSAGES[error] : undefined} />

      <div className="mt-6">
        <UsersTable users={users} currentUserId={session.userId} />
      </div>
    </div>
  );
}

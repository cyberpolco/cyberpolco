import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { getUsers } from "@/lib/db/users";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { deleteUserAction } from "@/lib/actions/users";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import ErrorToast from "@/app/admin/_components/ErrorToast";

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

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Last login</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">{u.email}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{ROLE_LABELS[u.role]}</td>
                <td className="px-5 py-3">
                  {u.mustChangePassword ? (
                    <span className="rounded-full bg-brand-yellow/10 px-2.5 py-1 text-xs font-semibold text-brand-yellow">
                      Pending first login
                    </span>
                  ) : (
                    <span className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-blue">
                      Active
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/users/${u.id}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    {u.id !== session.userId && (
                      <DeleteButton
                        action={deleteUserAction}
                        id={u.id}
                        confirmTitle="Delete this user?"
                        confirmBody={`${u.email} will lose access immediately.`}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

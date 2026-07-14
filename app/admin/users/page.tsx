import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { getUsers } from "@/lib/db/users";
import { ROLE_LABELS } from "@/lib/auth/roles";
import { deleteUserAction } from "@/lib/actions/users";

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Users</h1>
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

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 text-xs uppercase tracking-wide text-brand-gray">
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
              <tr key={u.id} className="border-t border-black/5">
                <td className="px-5 py-3 font-medium text-brand-dark">{u.email}</td>
                <td className="px-5 py-3 text-brand-gray">{ROLE_LABELS[u.role]}</td>
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
                <td className="px-5 py-3 text-brand-gray">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/users/${u.id}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    {u.id !== session.userId && (
                      <form action={deleteUserAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <button type="submit" className="text-brand-red">
                          <Trash2 size={16} />
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-brand-gray">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

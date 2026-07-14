import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getStarlinkClients } from "@/lib/db/starlink";
import { deleteStarlinkClientAction } from "@/lib/actions/starlink";
import { requireRole } from "@/lib/auth/rbac";

export default async function StarlinkClientsPage() {
  await requireRole(["super_admin"]);

  const clients = await getStarlinkClients();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Starlink Management</h1>
        <Link
          href="/admin/starlink/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New client
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Client ID</th>
              <th className="px-5 py-3">Sites</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">{c.name}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.clientId}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.sites.length}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/starlink/${c.id}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    <form action={deleteStarlinkClientAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-brand-red">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No Starlink clients yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

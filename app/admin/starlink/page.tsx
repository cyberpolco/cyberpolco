import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getStarlinkClients } from "@/lib/db/starlink";
import { getPendingChanges } from "@/lib/db/pending-changes";
import { deleteStarlinkClientAction } from "@/lib/actions/starlink";
import { requireRole } from "@/lib/auth/rbac";
import DeleteButton from "@/app/admin/_components/DeleteButton";

export default async function StarlinkClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  const session = await requireRole(["super_admin", "technician"]);
  const { pending } = await searchParams;

  const [clients, pendingChanges] = await Promise.all([
    getStarlinkClients(),
    getPendingChanges("pending"),
  ]);
  const pendingTargetIds = new Set(
    pendingChanges.filter((c) => c.targetTable === "starlink_client").map((c) => c.targetId)
  );

  return (
    <div>
      {pending === "1" && (
        <div className="mb-4 rounded-xl bg-brand-blue/10 p-4 text-sm text-brand-dark dark:text-white">
          Your changes have been submitted for super_admin approval.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Starlink Management</h1>
        <Link
          href="/admin/starlink/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New client
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
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
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                  {c.name}
                  {pendingTargetIds.has(c.id) && (
                    <span className="ml-2 rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-semibold text-status-warning">
                      Pending review
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.clientId}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.sites.length}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/starlink/${c.id}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    {session.role === "super_admin" && (
                      <DeleteButton
                        action={deleteStarlinkClientAction}
                        id={c.id}
                        confirmTitle="Delete this client?"
                        confirmBody={`"${c.name}" and its sites will be permanently removed.`}
                      />
                    )}
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
    </div>
  );
}

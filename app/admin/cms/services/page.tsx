import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getServices } from "@/lib/db/services";
import { getPendingChanges } from "@/lib/db/pending-changes";
import { latestChangeByTargetId } from "@/lib/pending-changes/review";
import { deleteServiceAction } from "@/lib/actions/services";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import ChangeStatusBadge from "@/app/admin/pending-changes/_components/ChangeStatusBadge";

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  await requireRole(["super_admin", "content_editor"]);
  const { pending } = await searchParams;

  const [services, allChanges] = await Promise.all([getServices(), getPendingChanges()]);
  const latestChangeBySlug = latestChangeByTargetId(allChanges.filter((c) => c.targetTable === "service"));

  return (
    <div>
      <BackLink href="/admin/cms" label="Back to CMS" />

      {pending === "1" && (
        <div className="mt-4 rounded-xl bg-brand-blue/10 p-4 text-sm text-brand-dark dark:text-white">
          Your changes have been submitted for super_admin approval.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Services</h1>
        <Link
          href="/admin/cms/services/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New service
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Name (EN)</th>
              <th className="px-5 py-3">Icon</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.slug} className="border-t border-black/5 dark:border-white/10">
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                  {s.en.name}
                  <ChangeStatusBadge change={latestChangeBySlug.get(s.slug)} />
                </td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{s.icon}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{s.slug}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/cms/services/${s.slug}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton
                      action={deleteServiceAction}
                      id={s.slug}
                      fieldName="slug"
                      confirmTitle="Delete this service?"
                      confirmBody={`"${s.en.name}" will be permanently removed.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No services yet.
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

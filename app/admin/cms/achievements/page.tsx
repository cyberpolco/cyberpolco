import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getSortedAchievements } from "@/lib/db/achievements";
import { deleteAchievementAction } from "@/lib/actions/achievements";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";
import DeleteButton from "@/app/admin/_components/DeleteButton";

export default async function AdminAchievementsPage() {
  await requireRole(["super_admin", "content_editor"]);

  const items = await getSortedAchievements();

  return (
    <div>
      <BackLink href="/admin/cms" label="Back to CMS" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Achievements</h1>
        <Link
          href="/admin/cms/achievements/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New achievement
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Title (EN)</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{a.date}</td>
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">{a.en.title}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/cms/achievements/${a.id}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton
                      action={deleteAchievementAction}
                      id={a.id}
                      fieldName="id"
                      confirmTitle="Delete this achievement?"
                      confirmBody={`"${a.en.title}" will be permanently removed.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No achievements yet.
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

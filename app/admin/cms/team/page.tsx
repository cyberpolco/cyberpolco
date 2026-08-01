import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getTeamMembers } from "@/lib/db/team";
import { getPendingChanges } from "@/lib/db/pending-changes";
import { latestChangeByTargetId } from "@/lib/pending-changes/review";
import { deleteTeamMemberAction } from "@/lib/actions/team";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import ChangeStatusBadge from "@/app/admin/pending-changes/_components/ChangeStatusBadge";

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  await requireRole(["super_admin", "content_editor"]);
  const { pending } = await searchParams;

  const [members, allChanges] = await Promise.all([getTeamMembers(), getPendingChanges()]);
  const latestChangeById = latestChangeByTargetId(allChanges.filter((c) => c.targetTable === "team_member"));

  return (
    <div>
      <BackLink href="/admin/cms" label="Back to CMS" />

      {pending === "1" && (
        <div className="mt-4 rounded-xl bg-brand-blue/10 p-4 text-sm text-brand-dark dark:text-white">
          Your changes have been submitted for super_admin approval.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Team</h1>
        <Link
          href="/admin/cms/team/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New team member
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Photo</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Title (EN)</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-5 py-3">
                  <div className="relative h-9 w-9 overflow-hidden rounded-full border border-black/5 dark:border-white/10">
                    <Image src={m.photo || "/images/logo-mark.png"} alt="" fill sizes="36px" className="object-cover" />
                  </div>
                </td>
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                  {m.name}
                  <ChangeStatusBadge change={latestChangeById.get(m.id)} />
                </td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{m.en.title}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/cms/team/${m.id}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton
                      action={deleteTeamMemberAction}
                      id={m.id}
                      fieldName="id"
                      confirmTitle="Delete this team member?"
                      confirmBody={`"${m.name}" will be permanently removed.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No team members yet.
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

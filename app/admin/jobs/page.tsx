import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getJobs } from "@/lib/db/jobs";
import { deleteJobAction } from "@/lib/actions/jobs";
import { requireRole } from "@/lib/auth/rbac";
import DeleteButton from "@/app/admin/_components/DeleteButton";

export default async function AdminJobsPage() {
  await requireRole(["super_admin", "hr_recruiter"]);

  const jobs = await getJobs();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Jobs</h1>
        <Link
          href="/admin/jobs/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New job
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Title (EN)</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">{j.en.title}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      j.status === "open"
                        ? "bg-brand-blue/10 text-brand-blue"
                        : "bg-black/5 dark:bg-white/10 text-brand-gray dark:text-white/60"
                    }`}
                  >
                    {j.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{j.slug}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/jobs/${j.id}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    <DeleteButton
                      action={deleteJobAction}
                      id={j.id}
                      confirmTitle="Delete this job posting?"
                      confirmBody={`"${j.en.title}" will be permanently removed.`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No jobs yet — the public Careers page will show &quot;No open positions&quot;.
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

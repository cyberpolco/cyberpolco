import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getJobs } from "@/lib/db/jobs";
import { deleteJobAction } from "@/lib/actions/jobs";
import { requireRole } from "@/lib/auth/rbac";

export default async function AdminJobsPage() {
  await requireRole(["super_admin", "hr_recruiter"]);

  const jobs = await getJobs();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Jobs</h1>
        <Link
          href="/admin/jobs/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New job
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 text-xs uppercase tracking-wide text-brand-gray">
            <tr>
              <th className="px-5 py-3">Title (EN)</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t border-black/5">
                <td className="px-5 py-3 font-medium text-brand-dark">{j.en.title}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      j.status === "open"
                        ? "bg-brand-blue/10 text-brand-blue"
                        : "bg-black/5 text-brand-gray"
                    }`}
                  >
                    {j.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-brand-gray">{j.slug}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/jobs/${j.id}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    <form action={deleteJobAction}>
                      <input type="hidden" name="id" value={j.id} />
                      <button type="submit" className="text-brand-red">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-brand-gray">
                  No jobs yet — the public Careers page will show &quot;No open positions&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

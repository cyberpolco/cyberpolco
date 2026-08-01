import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import { getAcademyCourses } from "@/lib/db/academy";
import { getPendingChanges } from "@/lib/db/pending-changes";
import { deleteAcademyCourseAction } from "@/lib/actions/academy";
import { requireRole } from "@/lib/auth/rbac";
import { formatUsdCents } from "@/lib/content/money";
import BackLink from "@/app/admin/_components/BackLink";
import DeleteButton from "@/app/admin/_components/DeleteButton";

export default async function AcademyCoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  const session = await requireRole(["super_admin", "teacher"]);
  const { pending } = await searchParams;

  const [courses, pendingChanges] = await Promise.all([getAcademyCourses(), getPendingChanges("pending")]);
  const pendingTargetIds = new Set(
    pendingChanges.filter((c) => c.targetTable === "academy_course").map((c) => c.targetId)
  );

  return (
    <div>
      <BackLink href="/admin/academy" label="Back to Academy" />

      {pending === "1" && (
        <div className="mt-4 rounded-xl bg-brand-blue/10 p-4 text-sm text-brand-dark dark:text-white">
          Your changes have been submitted for super_admin approval.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Courses</h1>
        <Link
          href="/admin/academy/courses/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New course
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Course ID</th>
              <th className="px-5 py-3">Title (EN)</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Modules</th>
              <th className="px-5 py-3">Lessons</th>
              <th className="px-5 py-3">Fee</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-5 py-3 font-mono text-brand-gray dark:text-white/60">{c.courseId ?? "—"}</td>
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                  {c.en.title}
                  {pendingTargetIds.has(c.id) && (
                    <span className="ml-2 rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-semibold text-status-warning">
                      Pending review
                    </span>
                  )}
                </td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.slug}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.modules.length}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                  {c.modules.reduce((n, m) => n + m.lessons.length, 0)}
                </td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                  {c.enrollmentFeeCents ? formatUsdCents(c.enrollmentFeeCents) : "Free"}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/academy/courses/${c.id}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    {session.role === "super_admin" && (
                      <DeleteButton
                        action={deleteAcademyCourseAction}
                        id={c.id}
                        confirmTitle="Delete this course?"
                        confirmBody={`"${c.en.title}" and all its modules and lessons will be permanently removed.`}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No courses yet.
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

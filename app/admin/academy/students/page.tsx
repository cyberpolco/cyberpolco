import Link from "next/link";
import { Plus, BadgeCheck } from "lucide-react";
import { getAcademyEnrollments, getAcademyCourses, progressPercent } from "@/lib/db/academy";
import { getPendingChanges } from "@/lib/db/pending-changes";
import { deleteEnrollmentAction } from "@/lib/actions/academy";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";
import DeleteButton from "@/app/admin/_components/DeleteButton";

export default async function AcademyStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  const session = await requireRole(["super_admin", "teacher"]);
  const { pending } = await searchParams;

  const [enrollments, courses, pendingChanges] = await Promise.all([
    getAcademyEnrollments(),
    getAcademyCourses(),
    getPendingChanges("pending"),
  ]);
  const courseById = new Map(courses.map((c) => [c.id, c]));
  const pendingTargetIds = new Set(
    pendingChanges.filter((c) => c.targetTable === "academy_enrollment").map((c) => c.targetId)
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
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Students</h1>
        <Link
          href="/admin/academy/students/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New student
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Student ID</th>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Course</th>
              <th className="px-5 py-3">Progress</th>
              <th className="px-5 py-3">Certificate</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => {
              const course = courseById.get(e.courseId);
              return (
                <tr key={e.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                    {e.studentId}
                    {pendingTargetIds.has(e.id) && (
                      <span className="ml-2 rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-semibold text-status-warning">
                        Pending review
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{e.studentName}</td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{course?.en.title ?? "—"}</td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{progressPercent(e, course)}%</td>
                  <td className="px-5 py-3">
                    {e.certificateIssued && <BadgeCheck size={16} className="text-brand-blue" />}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/academy/students/${e.id}`} className="text-brand-blue">
                        View
                      </Link>
                      {session.role === "super_admin" && (
                        <DeleteButton
                          action={deleteEnrollmentAction}
                          id={e.id}
                          confirmTitle="Remove this enrollment?"
                          confirmBody={`${e.studentName}'s enrollment will be permanently removed.`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {enrollments.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No students enrolled yet.
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

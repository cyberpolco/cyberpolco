import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/rbac";
import { getAcademyEnrollmentById, getEnrollmentsByStudentId, getAcademyCourses } from "@/lib/db/academy";
import { progressPercent, totalLessons } from "@/lib/academy/progress";

export default async function ProgressReportPage() {
  const session = await getSession();
  if (session?.role !== "viewer" || session.viewerType !== "academy_student") redirect("/admin/dashboard");

  const linkedEnrollment = session.linkedId ? await getAcademyEnrollmentById(session.linkedId) : undefined;
  const [enrollments, courses] = await Promise.all([
    linkedEnrollment ? getEnrollmentsByStudentId(linkedEnrollment.studentId) : Promise.resolve([]),
    getAcademyCourses(),
  ]);
  const courseById = new Map(courses.map((c) => [c.id, c]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Progress Report</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Your progress across every course you&apos;re enrolled in.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
              <tr>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Lessons completed</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Certificate</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((e) => {
                const course = courseById.get(e.courseId);
                const percent = progressPercent(e, course);
                return (
                  <tr key={e.id} className="border-t border-black/5 dark:border-white/10">
                    <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                      {course?.en.title ?? "Unknown course"}
                    </td>
                    <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                      {e.completedLessonIds.length} / {totalLessons(course)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                          <div className="h-full rounded-full bg-brand-blue" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-brand-gray dark:text-white/60">{percent}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {e.certificateIssued ? (
                        <span className="rounded-full bg-status-good/15 px-2.5 py-0.5 text-xs font-semibold text-status-good">
                          Issued
                        </span>
                      ) : (
                        <span className="text-brand-gray dark:text-white/60">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                    You&apos;re not enrolled in any courses yet.
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

import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, Lock, Award } from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import { getAcademyEnrollmentById, getEnrollmentsByStudentId, getAcademyCourses } from "@/lib/db/academy";
import { progressPercent } from "@/lib/academy/progress";
import { formatUsdCents } from "@/lib/content/money";
import { selfEnrollAction } from "@/lib/actions/academy";
import SubmitButton from "@/app/admin/_components/SubmitButton";

export default async function MyCoursesPage() {
  const session = await getSession();
  if (session?.role !== "viewer" || session.viewerType !== "academy_student") redirect("/admin/dashboard");

  const linkedEnrollment = session.linkedId ? await getAcademyEnrollmentById(session.linkedId) : undefined;
  const [enrollments, courses] = await Promise.all([
    linkedEnrollment ? getEnrollmentsByStudentId(linkedEnrollment.studentId) : Promise.resolve([]),
    getAcademyCourses(),
  ]);

  const courseById = new Map(courses.map((c) => [c.id, c]));
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const availableCourses = courses.filter((c) => !enrolledCourseIds.has(c.id));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">My Courses</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Click a course to see its modules and lessons, or enroll yourself in another available course below.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {enrollments.map((enrollment) => {
          const course = courseById.get(enrollment.courseId);
          const percent = progressPercent(enrollment, course);
          const locked = !!course?.enrollmentFeeCents && !enrollment.feePaid;

          return (
            <Link
              key={enrollment.id}
              href={`/admin/academy/my-courses/${enrollment.id}`}
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-2 text-brand-dark dark:text-white">
                <GraduationCap size={18} className="text-brand-blue" />
                <h2 className="font-semibold">{course?.en.title ?? "Unknown course"}</h2>
              </div>
              {course?.en.description && (
                <p className="mt-2 line-clamp-2 text-sm text-brand-gray dark:text-white/60">
                  {course.en.description}
                </p>
              )}

              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="text-brand-gray dark:text-white/60">Progress</span>
                <span className="font-medium text-brand-dark dark:text-white">{percent}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-full rounded-full bg-brand-blue" style={{ width: `${percent}%` }} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {locked && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-yellow/15 px-2.5 py-0.5 text-xs font-semibold text-brand-yellow">
                    <Lock size={11} /> Fee unpaid
                  </span>
                )}
                {enrollment.certificateIssued && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-status-good/15 px-2.5 py-0.5 text-xs font-semibold text-status-good">
                    <Award size={11} /> Certificate earned
                  </span>
                )}
              </div>
            </Link>
          );
        })}
        {enrollments.length === 0 && (
          <p className="rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-center text-sm text-brand-gray dark:text-white/60 sm:col-span-2">
            You&apos;re not enrolled in any courses yet.
          </p>
        )}
      </div>

      <h2 className="mt-10 text-lg font-bold text-brand-dark dark:text-white">Available courses</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {availableCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-5"
          >
            <div className="flex items-center gap-2 text-brand-dark dark:text-white">
              <GraduationCap size={16} className="text-brand-blue" />
              <h3 className="font-semibold">{course.en.title}</h3>
            </div>
            <p className="mt-1 text-sm text-brand-gray dark:text-white/60">{course.en.description}</p>
            <p className="mt-2 text-xs text-brand-gray dark:text-white/60">
              {course.enrollmentFeeCents ? `Enrollment fee: ${formatUsdCents(course.enrollmentFeeCents)}` : "Free"}
            </p>
            <form action={selfEnrollAction} className="mt-3">
              <input type="hidden" name="courseId" value={course.id} />
              <SubmitButton variant="subtle" pendingLabel="Enrolling...">
                Enroll
              </SubmitButton>
            </form>
          </div>
        ))}
        {availableCourses.length === 0 && (
          <p className="text-sm text-brand-gray dark:text-white/60 sm:col-span-2">
            No other courses are available right now.
          </p>
        )}
      </div>
    </div>
  );
}

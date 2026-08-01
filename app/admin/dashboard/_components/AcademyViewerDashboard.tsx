import Link from "next/link";
import { GraduationCap, Award, TrendingUp } from "lucide-react";
import { progressPercent } from "@/lib/academy/progress";
import type { AcademyCourse, AcademyEnrollment } from "@/lib/db/academy";

// Read-only overview — the interactive parts (lesson access, marking
// progress, paying, self-enrolling) live on the My Courses page now.
export default function AcademyViewerDashboard({
  enrollments,
  courses,
}: {
  enrollments: AcademyEnrollment[];
  courses: AcademyCourse[];
}) {
  if (enrollments.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Dashboard</h1>
        <p className="mt-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          You&apos;re not enrolled in any courses yet. Contact your administrator, or browse{" "}
          <Link href="/admin/academy/my-courses" className="text-brand-blue hover:underline">
            available courses
          </Link>
          .
        </p>
      </div>
    );
  }

  const courseById = new Map(courses.map((c) => [c.id, c]));
  const percents = enrollments.map((e) => progressPercent(e, courseById.get(e.courseId)));
  const averageProgress = Math.round(percents.reduce((sum, p) => sum + p, 0) / percents.length);
  const certificatesEarned = enrollments.filter((e) => e.certificateIssued).length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Dashboard</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">An overview of your Academy progress.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
          <GraduationCap className="text-brand-blue" size={22} />
          <p className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">{enrollments.length}</p>
          <p className="mt-1 text-sm text-brand-gray dark:text-white/60">Enrolled courses</p>
        </div>
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
          <TrendingUp className="text-brand-blue" size={22} />
          <p className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">{averageProgress}%</p>
          <p className="mt-1 text-sm text-brand-gray dark:text-white/60">Average progress</p>
        </div>
        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
          <Award className="text-brand-blue" size={22} />
          <p className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">{certificatesEarned}</p>
          <p className="mt-1 text-sm text-brand-gray dark:text-white/60">Certificates earned</p>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-blue">Your courses</h2>
          <Link href="/admin/academy/my-courses" className="text-sm font-semibold text-brand-blue hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-4">
          {enrollments.map((e) => {
            const course = courseById.get(e.courseId);
            const percent = progressPercent(e, course);
            return (
              <div key={e.id}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-brand-dark dark:text-white">
                    {course?.en.title ?? "Unknown course"}
                  </span>
                  <span className="text-brand-gray dark:text-white/60">{percent}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
                  <div className="h-full rounded-full bg-brand-blue" style={{ width: `${percent}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

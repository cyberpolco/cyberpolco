import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CircleCheckBig, Circle } from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import { requireOwnEnrollmentPage } from "@/lib/academy/access";
import { getAcademyCourseById, getQuizSubmissionsForEnrollment } from "@/lib/db/academy";
import BackLink from "@/app/admin/_components/BackLink";
import QuizStatusCard from "@/app/admin/academy/_components/QuizStatusCard";

export default async function ModuleDetailPage({
  params,
}: {
  params: Promise<{ enrollmentId: string; moduleId: string }>;
}) {
  const session = await getSession();
  const { enrollmentId, moduleId } = await params;
  const enrollment = await requireOwnEnrollmentPage(session, enrollmentId);

  const [course, submissions] = await Promise.all([
    getAcademyCourseById(enrollment.courseId),
    getQuizSubmissionsForEnrollment(enrollment.id),
  ]);
  if (!course) notFound();

  // Fee lock is enforced at the course level (my-courses/[enrollmentId]) —
  // re-check here too so a direct link can't bypass it.
  if (course.enrollmentFeeCents && !enrollment.feePaid) redirect(`/admin/academy/my-courses/${enrollment.id}`);

  const courseModule = course.modules.find((m) => m.id === moduleId);
  if (!courseModule) notFound();

  const completed = new Set(enrollment.completedLessonIds);

  return (
    <div className="max-w-2xl">
      <BackLink href={`/admin/academy/my-courses/${enrollment.id}`} label={`Back to ${course.en.title}`} />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">{courseModule.title}</h1>

      <div className="mt-6 space-y-3">
        {courseModule.lessons.map((l) => {
          const isDone = completed.has(l.id);
          return (
            <Link
              key={l.id}
              href={`/admin/academy/my-courses/${enrollment.id}/modules/${moduleId}/lessons/${l.id}`}
              className="flex items-center gap-2 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-4 text-sm font-medium text-brand-dark dark:text-white transition-shadow hover:shadow-md"
            >
              {isDone ? (
                <CircleCheckBig size={16} className="text-brand-blue" />
              ) : (
                <Circle size={16} className="text-black/20 dark:text-white/20" />
              )}
              {l.title}
            </Link>
          );
        })}
        {courseModule.lessons.length === 0 && (
          <p className="rounded-xl border border-dashed border-black/15 dark:border-white/15 p-6 text-center text-sm text-brand-gray dark:text-white/60">
            This module has no lessons yet.
          </p>
        )}
      </div>

      <QuizStatusCard
        label="Module Test"
        quiz={courseModule.test}
        submission={courseModule.test ? submissions.find((s) => s.quizId === courseModule.test?.id) : undefined}
        href={courseModule.test ? `/admin/academy/my-courses/${enrollment.id}/quiz/${courseModule.test.id}` : ""}
      />
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { CircleCheckBig, Circle } from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import { requireOwnEnrollmentPage } from "@/lib/academy/access";
import { getAcademyCourseById, getQuizSubmissionsForEnrollment } from "@/lib/db/academy";
import { updateOwnProgressAction } from "@/lib/actions/academy";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import BackLink from "@/app/admin/_components/BackLink";
import LessonMaterialViewer from "@/app/admin/academy/_components/LessonMaterialViewer";
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
            <div key={l.id} className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-brand-dark dark:text-white">
                  {isDone ? (
                    <CircleCheckBig size={16} className="text-brand-blue" />
                  ) : (
                    <Circle size={16} className="text-black/20 dark:text-white/20" />
                  )}
                  {l.title}
                </div>
                <form action={updateOwnProgressAction}>
                  <input type="hidden" name="enrollmentId" value={enrollment.id} />
                  <input type="hidden" name="lessonId" value={l.id} />
                  <input type="hidden" name="completed" value={(!isDone).toString()} />
                  <SubmitButton variant="compact" pendingLabel="Saving...">
                    {isDone ? "Mark incomplete" : "Mark complete"}
                  </SubmitButton>
                </form>
              </div>
              {l.description && (
                <p className="mt-2 text-sm text-brand-gray dark:text-white/60">{l.description}</p>
              )}
              {l.materialUrl && (
                <div className="mt-2">
                  <LessonMaterialViewer materialUrl={l.materialUrl} materialFileName={l.materialFileName} />
                </div>
              )}
            </div>
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

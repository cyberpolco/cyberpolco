import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/rbac";
import { requireOwnEnrollmentPage } from "@/lib/academy/access";
import { getAcademyCourseById } from "@/lib/db/academy";
import { updateOwnProgressAction } from "@/lib/actions/academy";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import BackLink from "@/app/admin/_components/BackLink";
import LessonMaterialViewer from "@/app/admin/academy/_components/LessonMaterialViewer";

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ enrollmentId: string; moduleId: string; lessonId: string }>;
}) {
  const session = await getSession();
  const { enrollmentId, moduleId, lessonId } = await params;
  const enrollment = await requireOwnEnrollmentPage(session, enrollmentId);

  const course = await getAcademyCourseById(enrollment.courseId);
  if (!course) notFound();

  // Fee lock is enforced at the course level (my-courses/[enrollmentId]) —
  // re-check here too so a direct link can't bypass it.
  if (course.enrollmentFeeCents && !enrollment.feePaid) redirect(`/admin/academy/my-courses/${enrollment.id}`);

  const courseModule = course.modules.find((m) => m.id === moduleId);
  if (!courseModule) notFound();

  const lesson = courseModule.lessons.find((l) => l.id === lessonId);
  if (!lesson) notFound();

  const isDone = enrollment.completedLessonIds.includes(lesson.id);
  const modulePath = `/admin/academy/my-courses/${enrollment.id}/modules/${moduleId}`;
  const lessonPath = `${modulePath}/lessons/${lesson.id}`;

  return (
    <div className="max-w-2xl">
      <BackLink href={modulePath} label={`Back to ${courseModule.title}`} />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">{lesson.title}</h1>
      {lesson.description && <p className="mt-2 text-brand-gray dark:text-white/60">{lesson.description}</p>}

      {lesson.materialUrl && (
        <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
          <LessonMaterialViewer materialUrl={lesson.materialUrl} materialFileName={lesson.materialFileName} />
        </div>
      )}

      <form action={updateOwnProgressAction} className="mt-6">
        <input type="hidden" name="enrollmentId" value={enrollment.id} />
        <input type="hidden" name="lessonId" value={lesson.id} />
        <input type="hidden" name="completed" value={(!isDone).toString()} />
        <input type="hidden" name="redirectTo" value={lessonPath} />
        <SubmitButton pendingLabel="Saving...">{isDone ? "Mark incomplete" : "Mark complete"}</SubmitButton>
      </form>
    </div>
  );
}

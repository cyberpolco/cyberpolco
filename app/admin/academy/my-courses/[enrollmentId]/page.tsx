import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, BookOpen, FileDown } from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import { requireOwnEnrollmentPage } from "@/lib/academy/access";
import { getAcademyCourseById, getQuizSubmissionsForEnrollment } from "@/lib/db/academy";
import { getLatestPawaPayTransactionForReference } from "@/lib/db/payments";
import { progressPercent } from "@/lib/academy/progress";
import { formatUsdCents } from "@/lib/content/money";
import { initiateAcademyDepositAction, refreshAcademyDepositStatusAction } from "@/lib/actions/academy";
import PayWithMobileMoneyButton from "@/app/admin/_components/PayWithMobileMoneyButton";
import BackLink from "@/app/admin/_components/BackLink";
import QuizStatusCard from "@/app/admin/academy/_components/QuizStatusCard";
import LessonMaterialViewer from "@/app/admin/academy/_components/LessonMaterialViewer";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ enrollmentId: string }>;
}) {
  const session = await getSession();
  const { enrollmentId } = await params;
  const enrollment = await requireOwnEnrollmentPage(session, enrollmentId);

  const [course, submissions] = await Promise.all([
    getAcademyCourseById(enrollment.courseId),
    getQuizSubmissionsForEnrollment(enrollment.id),
  ]);
  if (!course) notFound();

  const submissionByQuizId = new Map(submissions.map((s) => [s.quizId, s]));
  const percent = progressPercent(enrollment, course);
  const locked = !!course.enrollmentFeeCents && !enrollment.feePaid;

  const pendingDepositTx = locked
    ? await getLatestPawaPayTransactionForReference("academy_fee", enrollment.id)
    : undefined;
  const pendingDeposit = pendingDepositTx
    ? { pawapayId: pendingDepositTx.pawapayId, status: pendingDepositTx.status }
    : null;

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/academy/my-courses" label="Back to My Courses" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">{course.en.title}</h1>
      {course.en.description && <p className="mt-1 text-brand-gray dark:text-white/60">{course.en.description}</p>}

      <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-brand-dark dark:text-white">Overall progress</span>
          <span className="text-brand-gray dark:text-white/60">{percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div className="h-full rounded-full bg-brand-blue" style={{ width: `${percent}%` }} />
        </div>

        {locked && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-brand-dark dark:text-white">
              <Lock size={16} className="text-brand-yellow" />
              This course requires a one-time enrollment fee of {formatUsdCents(course.enrollmentFeeCents!)} before
              you can open its modules.
            </p>
            <PayWithMobileMoneyButton
              fieldName="enrollmentId"
              fieldValue={enrollment.id}
              priceLabel={formatUsdCents(course.enrollmentFeeCents!)}
              defaultPhone={enrollment.phone}
              pendingDeposit={pendingDeposit}
              action={initiateAcademyDepositAction}
              refreshAction={refreshAcademyDepositStatusAction}
              triggerClassName="flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
            />
          </div>
        )}
      </div>

      {!locked && (
        <>
          <h2 className="mt-8 text-lg font-bold text-brand-dark dark:text-white">Modules</h2>
          <div className="mt-4 space-y-3">
            {course.modules.map((m) => {
              const total = m.lessons.length;
              const done = m.lessons.filter((l) => enrollment.completedLessonIds.includes(l.id)).length;
              return (
                <Link
                  key={m.id}
                  href={`/admin/academy/my-courses/${enrollment.id}/modules/${m.id}`}
                  className="flex items-center justify-between rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2 text-sm font-medium text-brand-dark dark:text-white">
                    <BookOpen size={16} className="text-brand-blue" />
                    {m.title}
                  </div>
                  <span className="text-sm text-brand-gray dark:text-white/60">
                    {done} / {total} lessons
                  </span>
                </Link>
              );
            })}
            {course.modules.length === 0 && (
              <p className="rounded-xl border border-dashed border-black/15 dark:border-white/15 p-6 text-center text-sm text-brand-gray dark:text-white/60">
                This course has no modules yet.
              </p>
            )}
          </div>

          <QuizStatusCard
            label="Final Exam"
            quiz={course.finalExam}
            submission={course.finalExam ? submissionByQuizId.get(course.finalExam.id) : undefined}
            href={course.finalExam ? `/admin/academy/my-courses/${enrollment.id}/quiz/${course.finalExam.id}` : ""}
          />

          {enrollment.certificateIssued && enrollment.certificateFileUrl && (
            <div className="mt-6">
              <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-brand-dark dark:text-white">
                <FileDown size={14} /> Certificate
              </p>
              <LessonMaterialViewer materialUrl={enrollment.certificateFileUrl} materialFileName="Certificate.pdf" />
            </div>
          )}
        </>
      )}
    </div>
  );
}

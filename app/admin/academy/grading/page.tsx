import Link from "next/link";
import { requireRole } from "@/lib/auth/rbac";
import { getSubmissionsPendingReview, getAcademyCourseById, getAcademyEnrollmentById } from "@/lib/db/academy";
import { findQuizById } from "@/lib/academy/quiz";
import { formatDateTime } from "@/lib/utils/date-format";

export default async function QuizGradingPage() {
  await requireRole(["super_admin", "teacher"]);

  const submissions = await getSubmissionsPendingReview();

  const rows = await Promise.all(
    submissions.map(async (submission) => {
      const enrollment = await getAcademyEnrollmentById(submission.enrollmentId);
      const course = enrollment ? await getAcademyCourseById(enrollment.courseId) : undefined;
      const quiz = course ? findQuizById(course, submission.quizId) : undefined;
      const pendingCount = submission.answers.filter((a) => a.reviewStatus === "pending").length;
      const failedCount = submission.answers.filter((a) => a.aiGradingStatus === "failed").length;
      return { submission, enrollment, course, quiz, pendingCount, failedCount };
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Quiz Grading</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Free-text answers graded by AI wait here for a teacher to approve or adjust — a student&apos;s score and
        course progression stay blocked until every answer on their submission is reviewed.
      </p>

      <div className="mt-6 space-y-3">
        {rows.map(({ submission, enrollment, course, quiz, pendingCount, failedCount }) => (
          <Link
            key={submission.id}
            href={`/admin/academy/grading/${submission.id}`}
            className="block rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-4 hover:border-brand-blue/30"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-brand-dark dark:text-white">
                  {enrollment?.studentName ?? "Unknown student"} — {course?.en.title ?? "Unknown course"}
                </p>
                <p className="text-sm text-brand-gray dark:text-white/60">
                  {quiz?.title ?? "Quiz"} · Submitted {formatDateTime(submission.submittedAt)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {failedCount > 0 && (
                  <span className="rounded-full bg-status-critical/15 px-2.5 py-0.5 text-xs font-semibold text-status-critical">
                    {failedCount} AI grading failed
                  </span>
                )}
                <span className="rounded-full bg-status-warning/15 px-2.5 py-0.5 text-xs font-semibold text-status-warning">
                  {pendingCount} pending review
                </span>
              </div>
            </div>
          </Link>
        ))}

        {rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-center text-sm text-brand-gray dark:text-white/60">
            Nothing waiting on review.
          </div>
        )}
      </div>
    </div>
  );
}

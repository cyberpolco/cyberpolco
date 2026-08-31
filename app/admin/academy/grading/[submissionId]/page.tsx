import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { getQuizSubmissionById, getAcademyCourseById, getAcademyEnrollmentById } from "@/lib/db/academy";
import { findQuizById } from "@/lib/academy/quiz";
import { approveAiGradingAction, adjustGradingAction, retryAiGradingAction } from "@/lib/actions/academy";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import BackLink from "@/app/admin/_components/BackLink";
import { formatDateTime } from "@/lib/utils/date-format";
import AnswerReviewBadge from "@/app/admin/academy/_components/AnswerReviewBadge";

export default async function QuizGradingDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  await requireRole(["super_admin", "teacher"]);
  const { submissionId } = await params;

  const submission = await getQuizSubmissionById(submissionId);
  if (!submission) notFound();

  const enrollment = await getAcademyEnrollmentById(submission.enrollmentId);
  const course = enrollment ? await getAcademyCourseById(enrollment.courseId) : undefined;
  const quiz = course ? findQuizById(course, submission.quizId) : undefined;

  const freeTextAnswers = submission.answers.filter((a) => a.questionType === "free_text");

  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/academy/grading" label="Back to Quiz Grading" />
      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">
        {enrollment?.studentName ?? "Unknown student"} — {quiz?.title ?? "Quiz"}
      </h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        {course?.en.title ?? "Unknown course"} · Submitted {formatDateTime(submission.submittedAt)}
      </p>

      <div className="mt-6 space-y-4">
        {freeTextAnswers.map((answer, i) => {
          const question = quiz?.questions.find((q) => q.id === answer.questionId);
          const rubric = question && question.type === "free_text" ? question.rubric : null;
          const modelAnswer = question && question.type === "free_text" ? question.modelAnswer : null;

          return (
            <div
              key={answer.id}
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="text-sm font-semibold text-brand-dark dark:text-white">
                  {i + 1}. {question?.text ?? "Question"}
                </p>
                <AnswerReviewBadge answer={answer} />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-black/[0.03] dark:bg-white/5 p-3 text-xs text-brand-gray dark:text-white/60">
                  <p className="font-semibold text-brand-dark dark:text-white">Grading rubric</p>
                  <p className="mt-1 whitespace-pre-wrap">{rubric}</p>
                </div>
                <div className="rounded-lg bg-black/[0.03] dark:bg-white/5 p-3 text-xs text-brand-gray dark:text-white/60">
                  <p className="font-semibold text-brand-dark dark:text-white">Model answer</p>
                  <p className="mt-1 whitespace-pre-wrap">{modelAnswer}</p>
                </div>
              </div>

              <div className="mt-3 rounded-lg border border-black/10 dark:border-white/15 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">
                  Student&apos;s response
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-brand-dark dark:text-white">
                  {answer.freeTextResponse}
                </p>
              </div>

              {answer.aiGradingStatus === "graded" && (
                <div className="mt-3 rounded-lg bg-brand-blue/5 p-3 text-sm">
                  <p className="font-semibold text-brand-blue">AI suggested score: {answer.aiScorePercent}%</p>
                  {answer.aiRationale && (
                    <p className="mt-1 text-xs text-brand-gray dark:text-white/60">{answer.aiRationale}</p>
                  )}
                </div>
              )}

              {answer.aiGradingStatus === "failed" && (
                <div className="mt-3 rounded-lg bg-status-critical/10 p-3 text-sm text-status-critical">
                  <p className="font-semibold">AI grading failed: {answer.aiError}</p>
                  <form action={retryAiGradingAction} className="mt-2">
                    <input type="hidden" name="answerId" value={answer.id} />
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <SubmitButton variant="compact" pendingLabel="Retrying...">
                      Retry AI grading
                    </SubmitButton>
                  </form>
                </div>
              )}

              {answer.reviewStatus === "pending" && (
                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-black/10 dark:border-white/15 pt-3">
                  {answer.aiGradingStatus === "graded" && (
                    <form action={approveAiGradingAction}>
                      <input type="hidden" name="answerId" value={answer.id} />
                      <input type="hidden" name="submissionId" value={submission.id} />
                      <SubmitButton
                        variant="subtle"
                        pendingLabel="Approving..."
                        className="!border-none !bg-status-good/10 !text-status-good hover:!bg-status-good/20"
                      >
                        Approve {answer.aiScorePercent}%
                      </SubmitButton>
                    </form>
                  )}

                  <form action={adjustGradingAction} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="answerId" value={answer.id} />
                    <input type="hidden" name="submissionId" value={submission.id} />
                    <div>
                      <label className="mb-1 block text-xs font-medium text-brand-gray dark:text-white/60">
                        Score (0-100)
                      </label>
                      <input
                        type="number"
                        name="scorePercent"
                        min={0}
                        max={100}
                        defaultValue={answer.aiScorePercent ?? undefined}
                        required
                        className="w-24 rounded-lg border border-black/10 dark:border-white/15 px-2.5 py-1.5 text-sm dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="mb-1 block text-xs font-medium text-brand-gray dark:text-white/60">
                        Note (optional)
                      </label>
                      <input
                        name="reviewNote"
                        placeholder="Shown to the student"
                        className="w-full min-w-[10rem] rounded-lg border border-black/10 dark:border-white/15 px-2.5 py-1.5 text-sm dark:bg-white/5 dark:text-white"
                      />
                    </div>
                    <SubmitButton variant="subtle" pendingLabel="Saving...">
                      Set score
                    </SubmitButton>
                  </form>
                </div>
              )}
            </div>
          );
        })}

        {freeTextAnswers.length === 0 && (
          <p className="text-sm text-brand-gray dark:text-white/60">
            This submission has no free-text answers awaiting review.
          </p>
        )}
      </div>
    </div>
  );
}

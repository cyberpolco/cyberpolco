import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/rbac";
import { requireOwnEnrollmentPage } from "@/lib/academy/access";
import { getAcademyCourseById, getQuizSubmission } from "@/lib/db/academy";
import { findQuizById, isQuizAvailable } from "@/lib/academy/quiz";
import { submitQuizAction } from "@/lib/actions/academy";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import BackLink from "@/app/admin/_components/BackLink";

export default async function QuizPage({
  params,
}: {
  params: Promise<{ enrollmentId: string; quizId: string }>;
}) {
  const session = await getSession();
  const { enrollmentId, quizId } = await params;
  const enrollment = await requireOwnEnrollmentPage(session, enrollmentId);

  const course = await getAcademyCourseById(enrollment.courseId);
  const quiz = course ? findQuizById(course, quizId) : undefined;
  if (!course || !quiz) notFound();

  const submission = await getQuizSubmission(enrollment.id, quizId);
  const backHref = `/admin/academy/my-courses/${enrollment.id}`;

  if (!submission && !isQuizAvailable(quiz, new Date())) {
    return (
      <div className="max-w-2xl">
        <BackLink href={backHref} label={`Back to ${course.en.title}`} />
        <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">{quiz.title}</h1>
        <p className="mt-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          {quiz.availableAt
            ? `This isn't available yet — it opens ${new Date(quiz.availableAt).toLocaleString()}.`
            : "This hasn't been scheduled yet by your instructor."}
        </p>
      </div>
    );
  }

  if (submission) {
    return (
      <div className="max-w-2xl">
        <BackLink href={backHref} label={`Back to ${course.en.title}`} />
        <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">{quiz.title}</h1>
        <p className="mt-1 text-brand-gray dark:text-white/60">
          Submitted {new Date(submission.submittedAt).toLocaleString()} — Score: {submission.scorePercent}%
        </p>

        <div className="mt-6 space-y-4">
          {quiz.questions.map((q, i) => {
            const selected = submission.answers[q.id];
            const isCorrect = selected === q.correctOptionIndex;
            return (
              <div
                key={q.id}
                className={`rounded-xl border p-4 ${
                  isCorrect ? "border-status-good/30 bg-status-good/5" : "border-status-critical/30 bg-status-critical/5"
                }`}
              >
                <p className="text-sm font-medium text-brand-dark dark:text-white">
                  {i + 1}. {q.text}
                </p>
                <div className="mt-2 space-y-1 text-sm">
                  {q.options.map((opt, oi) => (
                    <p
                      key={oi}
                      className={
                        oi === q.correctOptionIndex
                          ? "font-semibold text-status-good"
                          : oi === selected
                            ? "font-semibold text-status-critical"
                            : "text-brand-gray dark:text-white/60"
                      }
                    >
                      {opt}
                      {oi === q.correctOptionIndex && " (correct)"}
                      {oi === selected && oi !== q.correctOptionIndex && " (your answer)"}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <BackLink href={backHref} label={`Back to ${course.en.title}`} />
      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">{quiz.title}</h1>

      <form action={submitQuizAction} className="mt-6 space-y-6">
        <input type="hidden" name="enrollmentId" value={enrollment.id} />
        <input type="hidden" name="quizId" value={quizId} />

        {quiz.questions.map((q, i) => (
          <div
            key={q.id}
            className="rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-4"
          >
            <p className="text-sm font-medium text-brand-dark dark:text-white">
              {i + 1}. {q.text}
            </p>
            <div className="mt-2 space-y-1.5">
              {q.options.map((opt, oi) => (
                <label key={oi} className="flex items-center gap-2 text-sm text-brand-gray dark:text-white/60">
                  <input type="radio" name={`question_${q.id}`} value={oi} required className="h-4 w-4" />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
        {quiz.questions.length === 0 && (
          <p className="text-sm text-brand-gray dark:text-white/60">This quiz has no questions yet.</p>
        )}

        <SubmitButton pendingLabel="Submitting...">Submit</SubmitButton>
      </form>
    </div>
  );
}

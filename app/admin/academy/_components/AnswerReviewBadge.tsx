import type { QuizAnswer } from "@/lib/db/academy";

// Modeled on ChangeStatusBadge.tsx's pending/rejected badge pair, extended
// for the extra "AI suggested" and "adjusted" states a free_text answer can
// be in on the teacher review page.
export default function AnswerReviewBadge({ answer }: { answer: QuizAnswer }) {
  if (answer.reviewStatus === "approved") {
    return (
      <span className="rounded-full bg-status-good/15 px-2.5 py-0.5 text-xs font-semibold text-status-good">
        Approved
      </span>
    );
  }

  if (answer.reviewStatus === "adjusted") {
    return (
      <span className="rounded-full bg-brand-blue/15 px-2.5 py-0.5 text-xs font-semibold text-brand-blue">
        Adjusted — {answer.scorePercent}%
      </span>
    );
  }

  if (answer.aiGradingStatus === "failed") {
    return (
      <span className="rounded-full bg-status-critical/15 px-2.5 py-0.5 text-xs font-semibold text-status-critical">
        AI grading failed
      </span>
    );
  }

  if (answer.aiGradingStatus === "graded") {
    return (
      <span className="rounded-full bg-status-warning/15 px-2.5 py-0.5 text-xs font-semibold text-status-warning">
        AI suggested — pending review
      </span>
    );
  }

  return (
    <span className="rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium text-brand-gray dark:text-white/60">
      Grading...
    </span>
  );
}

import Link from "next/link";
import { Lock, FileQuestion } from "lucide-react";
import { isQuizAvailable } from "@/lib/academy/quiz";
import type { Quiz, QuizSubmission } from "@/lib/db/academy";

export default function QuizStatusCard({
  label,
  quiz,
  submission,
  href,
}: {
  label: string;
  quiz: Quiz | null;
  submission: QuizSubmission | undefined;
  href: string;
}) {
  if (!quiz) return null;

  const available = isQuizAvailable(quiz, new Date());

  return (
    <div className="mt-4 rounded-xl border border-black/5 dark:border-white/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-brand-dark dark:text-white">
          <FileQuestion size={16} className="text-brand-blue" />
          {label}: {quiz.title}
        </div>
        {submission ? (
          <span className="rounded-full bg-status-good/15 px-2.5 py-0.5 text-xs font-semibold text-status-good">
            Completed — {submission.scorePercent}%
          </span>
        ) : available ? (
          <Link
            href={href}
            className="rounded-full bg-brand-blue/10 px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-blue/15"
          >
            Take {label.toLowerCase()}
          </Link>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-black/5 dark:bg-white/10 px-2.5 py-0.5 text-xs font-medium text-brand-gray dark:text-white/60">
            <Lock size={11} />
            {quiz.availableAt ? `Available ${new Date(quiz.availableAt).toLocaleString()}` : "Not yet scheduled"}
          </span>
        )}
      </div>
    </div>
  );
}

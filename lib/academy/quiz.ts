import type {
  AcademyCourse,
  MultipleChoiceQuestion,
  MultipleSelectQuestion,
  Quiz,
  QuizAnswer,
} from "@/lib/db/academy";

// Type-only import above — see the identical note in lib/academy/progress.ts
// about not pulling lib/db/academy's runtime DB client into client bundles.

// A quiz with no availableAt (never scheduled) or one still in the future
// is inaccessible — the opposite default of a lesson, which is open unless
// explicitly locked.
export function isQuizAvailable(quiz: Quiz | null | undefined, now: Date): boolean {
  if (!quiz || !quiz.availableAt) return false;
  return new Date(quiz.availableAt).getTime() <= now.getTime();
}

export function scoreMultipleChoice(question: MultipleChoiceQuestion, selectedOptionIndex: number | null): number {
  return selectedOptionIndex === question.correctOptionIndex ? 100 : 0;
}

// Exact-set match — full credit only if the student picked every correct
// option and no incorrect ones, otherwise 0. No partial credit.
export function scoreMultipleSelect(
  question: MultipleSelectQuestion,
  selectedOptionIndexes: number[] | null
): number {
  const selected = new Set(selectedOptionIndexes ?? []);
  const correct = new Set(question.correctOptionIndexes);
  if (selected.size !== correct.size) return 0;
  for (const i of selected) if (!correct.has(i)) return 0;
  return 100;
}

// free_text has no synchronous scorer — see lib/academy/ai-grading.ts. Its
// answer row starts at scorePercent: 0 with aiGradingStatus/reviewStatus
// "pending" and is folded into computeSubmissionScore like any other answer
// once graded.

export function computeSubmissionScore(answers: { scorePercent: number }[]): number {
  if (answers.length === 0) return 0;
  return Math.round(answers.reduce((sum, a) => sum + a.scorePercent, 0) / answers.length);
}

// A submission is fully graded once no answer is still awaiting AI grading
// or teacher review — the choke point recomputeSubmissionScore uses to
// decide whether gradingStatus flips to "graded".
export function isSubmissionFullyGraded(answers: Pick<QuizAnswer, "aiGradingStatus" | "reviewStatus">[]): boolean {
  return answers.every((a) => a.aiGradingStatus !== "pending" && a.reviewStatus !== "pending");
}

// Searches every module's test plus the course's final exam for a matching
// quiz id — the two places a quiz can live on a course.
export function findQuizById(course: AcademyCourse | undefined, quizId: string): Quiz | undefined {
  if (!course) return undefined;
  if (course.finalExam?.id === quizId) return course.finalExam;
  for (const m of course.modules) {
    if (m.test?.id === quizId) return m.test;
  }
  return undefined;
}

// <input type="datetime-local"> round-trips through the server's local
// timezone (same simplification the rest of the app uses for dates, e.g.
// getNextStudentId) rather than doing full timezone-aware scheduling.
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

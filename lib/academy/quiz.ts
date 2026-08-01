import type { AcademyCourse, Quiz } from "@/lib/db/academy";

// Type-only import above — see the identical note in lib/academy/progress.ts
// about not pulling lib/db/academy's runtime DB client into client bundles.

// A quiz with no availableAt (never scheduled) or one still in the future
// is inaccessible — the opposite default of a lesson, which is open unless
// explicitly locked.
export function isQuizAvailable(quiz: Quiz | null | undefined, now: Date): boolean {
  if (!quiz || !quiz.availableAt) return false;
  return new Date(quiz.availableAt).getTime() <= now.getTime();
}

export function scoreQuiz(quiz: Quiz, answers: Record<string, number>): number {
  if (quiz.questions.length === 0) return 0;
  const correct = quiz.questions.filter((q) => answers[q.id] === q.correctOptionIndex).length;
  return Math.round((correct / quiz.questions.length) * 100);
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

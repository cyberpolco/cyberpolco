import type { AcademyCourse, LearningMode } from "@/lib/db/academy";
import { formatUsdCents } from "@/lib/content/money";

type CoursePrices = Pick<AcademyCourse, "selfPacedFeeCents" | "classroomFeeCents">;

export const LEARNING_MODE_LABELS: Record<LearningMode, string> = {
  self_paced: "Self-paced with a private tutor",
  classroom: "Classroom",
};

const SHORT_LABELS: Record<LearningMode, string> = { self_paced: "Self-paced", classroom: "Classroom" };

// Shown under the classroom option wherever it's offered — classroom
// sessions run on the tutor's schedule, not the student's.
export const CLASSROOM_TIMETABLE_NOTE = "Subject to the tutor's timetable.";

export function learningModeFeeCents(course: CoursePrices, mode: LearningMode): number | null {
  const cents = mode === "self_paced" ? course.selfPacedFeeCents : course.classroomFeeCents;
  return cents && cents > 0 ? cents : null;
}

// The modes a student can actually pay for, in display order — a mode with
// no price set isn't offered.
export function offeredLearningModes(course: CoursePrices): { mode: LearningMode; feeCents: number }[] {
  return (["self_paced", "classroom"] as const).flatMap((mode) => {
    const feeCents = learningModeFeeCents(course, mode);
    return feeCents ? [{ mode, feeCents }] : [];
  });
}

// A course paywalls lesson materials when at least one mode is priced.
export function courseHasFee(course: CoursePrices | undefined): boolean {
  return !!course && offeredLearningModes(course).length > 0;
}

// One-line price summary for lists/tables, e.g. "Self-paced $49.00 · Classroom $99.00".
export function formatCoursePricing(course: CoursePrices): string {
  const offered = offeredLearningModes(course);
  if (offered.length === 0) return "Free";
  return offered.map(({ mode, feeCents }) => `${SHORT_LABELS[mode]} ${formatUsdCents(feeCents)}`).join(" · ");
}

import type { AcademyEnrollment, Lesson } from "@/lib/db/academy";

// Type-only import above — see the identical note in lib/academy/progress.ts
// about not pulling lib/db/academy's runtime DB client into client bundles.

export type LessonAvailability =
  | { available: true }
  // opensAt null = locked with no date (only a per-student override can do this).
  | { available: false; opensAt: string | null };

type AvailabilityEnrollment = Pick<AcademyEnrollment, "learningMode" | "lessonAvailability">;

// Resolution order:
//   1. A per-student override (enrollment.lessonAvailability), if one is set
//      for this lesson — applies to every learning mode.
//   2. Self-paced students: every lesson is open.
//   3. Everyone else (classroom, free courses): the lesson's class schedule
//      (lesson.availableAt), where no date means open.
export function lessonAvailability(
  enrollment: AvailabilityEnrollment,
  lesson: Pick<Lesson, "id" | "availableAt">,
  now: Date
): LessonAvailability {
  const overrides = enrollment.lessonAvailability ?? {};
  if (Object.hasOwn(overrides, lesson.id)) return fromDate(overrides[lesson.id], now);
  if (enrollment.learningMode === "self_paced") return { available: true };
  return lesson.availableAt ? fromDate(lesson.availableAt, now) : { available: true };
}

function fromDate(availableAt: string | null, now: Date): LessonAvailability {
  if (!availableAt) return { available: false, opensAt: null };
  return new Date(availableAt).getTime() <= now.getTime()
    ? { available: true }
    : { available: false, opensAt: availableAt };
}

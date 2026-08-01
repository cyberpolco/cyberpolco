import type { AcademyCourse, AcademyEnrollment } from "@/lib/db/academy";

// Type-only import above — this file must stay free of any runtime import of
// lib/db/academy (and therefore lib/db/client, which opens a DB connection at
// module scope). It's imported directly by client components (e.g.
// StudentsTable) to render progress, and pulling in the DB client would ship
// a Neon connection attempt into the browser bundle and crash on render.

export function totalLessons(course: AcademyCourse | undefined): number {
  if (!course) return 0;
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export function progressPercent(enrollment: AcademyEnrollment, course: AcademyCourse | undefined): number {
  const total = totalLessons(course);
  if (total === 0) return 0;
  return Math.round((enrollment.completedLessonIds.length / total) * 100);
}

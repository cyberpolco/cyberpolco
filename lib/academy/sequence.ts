import type { AcademyCourse } from "@/lib/db/academy";

// Type-only import above — see the identical note in lib/academy/progress.ts
// about not pulling lib/db/academy's runtime DB client into client bundles.

// Drives the "what's next" prompt after a student finishes a lesson, a
// module test, or the final exam: next lesson -> (module test, if any) ->
// next module's first lesson -> (its test, if any) -> ... -> final exam.
export type NextStep =
  | { type: "lesson"; moduleId: string; lessonId: string; label: string }
  | { type: "test"; quizId: string; label: string }
  | { type: "exam"; quizId: string; label: string }
  | { type: "none" };

export function nextStepAfterModule(course: AcademyCourse, moduleIndex: number): NextStep {
  const nextModule = course.modules[moduleIndex + 1];
  if (nextModule) {
    const firstLesson = nextModule.lessons[0];
    if (firstLesson) {
      return {
        type: "lesson",
        moduleId: nextModule.id,
        lessonId: firstLesson.id,
        label: `Next module: ${nextModule.title}`,
      };
    }
    // The next module has no lessons of its own — skip straight to its
    // test (or the module after that, recursively) instead of dead-ending.
    if (nextModule.test) return { type: "test", quizId: nextModule.test.id, label: "Write your test" };
    return nextStepAfterModule(course, moduleIndex + 1);
  }

  if (course.finalExam) return { type: "exam", quizId: course.finalExam.id, label: "Final Exam" };
  return { type: "none" };
}

export function nextStepAfterLesson(course: AcademyCourse, moduleId: string, lessonId: string): NextStep {
  const moduleIndex = course.modules.findIndex((m) => m.id === moduleId);
  if (moduleIndex === -1) return { type: "none" };
  const courseModule = course.modules[moduleIndex];
  const lessonIndex = courseModule.lessons.findIndex((l) => l.id === lessonId);
  if (lessonIndex === -1) return { type: "none" };

  const nextLesson = courseModule.lessons[lessonIndex + 1];
  if (nextLesson) {
    return { type: "lesson", moduleId, lessonId: nextLesson.id, label: `Next lesson: ${nextLesson.title}` };
  }

  if (courseModule.test) return { type: "test", quizId: courseModule.test.id, label: "Write your test" };
  return nextStepAfterModule(course, moduleIndex);
}

export function nextStepAfterQuiz(course: AcademyCourse, quizId: string): NextStep {
  if (course.finalExam?.id === quizId) return { type: "none" };
  const moduleIndex = course.modules.findIndex((m) => m.test?.id === quizId);
  if (moduleIndex === -1) return { type: "none" };
  return nextStepAfterModule(course, moduleIndex);
}

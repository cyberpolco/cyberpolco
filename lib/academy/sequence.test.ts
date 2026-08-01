import { describe, expect, it } from "vitest";
import { nextStepAfterLesson, nextStepAfterModule, nextStepAfterQuiz } from "./sequence";
import type { AcademyCourse } from "@/lib/db/academy";

function lesson(id: string) {
  return { id, title: id, description: "", materialUrl: null, materialFileName: null };
}

function baseCourse(overrides: Partial<AcademyCourse> = {}): AcademyCourse {
  return {
    id: "course-1",
    courseId: null,
    slug: "course-1",
    fr: { title: "", description: "" },
    en: { title: "", description: "" },
    enrollmentFeeCents: null,
    finalExam: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: null,
    modules: [],
    ...overrides,
  };
}

describe("nextStepAfterLesson", () => {
  it("goes to the next lesson in the same module", () => {
    const course = baseCourse({
      modules: [{ id: "m1", title: "Module 1", test: null, lessons: [lesson("l1"), lesson("l2")] }],
    });
    expect(nextStepAfterLesson(course, "m1", "l1")).toEqual({
      type: "lesson",
      moduleId: "m1",
      lessonId: "l2",
      label: "Next lesson: l2",
    });
  });

  it("goes to the module test after the last lesson", () => {
    const course = baseCourse({
      modules: [
        {
          id: "m1",
          title: "Module 1",
          lessons: [lesson("l1")],
          test: { id: "test-1", title: "Test 1", availableAt: null, questions: [] },
        },
      ],
    });
    expect(nextStepAfterLesson(course, "m1", "l1")).toEqual({
      type: "test",
      quizId: "test-1",
      label: "Write your test",
    });
  });

  it("goes to the next module's first lesson when there's no test", () => {
    const course = baseCourse({
      modules: [
        { id: "m1", title: "Module 1", test: null, lessons: [lesson("l1")] },
        { id: "m2", title: "Module 2", test: null, lessons: [lesson("l2")] },
      ],
    });
    expect(nextStepAfterLesson(course, "m1", "l1")).toEqual({
      type: "lesson",
      moduleId: "m2",
      lessonId: "l2",
      label: "Next module: Module 2",
    });
  });

  it("goes to the final exam after the last lesson of the last module with no test", () => {
    const course = baseCourse({
      modules: [{ id: "m1", title: "Module 1", test: null, lessons: [lesson("l1")] }],
      finalExam: { id: "exam-1", title: "Final Exam", availableAt: null, questions: [] },
    });
    expect(nextStepAfterLesson(course, "m1", "l1")).toEqual({ type: "exam", quizId: "exam-1", label: "Final Exam" });
  });

  it("returns none at the very end of the course", () => {
    const course = baseCourse({ modules: [{ id: "m1", title: "Module 1", test: null, lessons: [lesson("l1")] }] });
    expect(nextStepAfterLesson(course, "m1", "l1")).toEqual({ type: "none" });
  });
});

describe("nextStepAfterModule", () => {
  it("skips an empty next module straight to its test", () => {
    const course = baseCourse({
      modules: [
        { id: "m1", title: "Module 1", test: null, lessons: [lesson("l1")] },
        { id: "m2", title: "Module 2", lessons: [], test: { id: "test-2", title: "Test 2", availableAt: null, questions: [] } },
      ],
    });
    expect(nextStepAfterModule(course, 0)).toEqual({ type: "test", quizId: "test-2", label: "Write your test" });
  });

  it("skips a completely empty module and reaches the final exam", () => {
    const course = baseCourse({
      modules: [
        { id: "m1", title: "Module 1", test: null, lessons: [lesson("l1")] },
        { id: "m2", title: "Module 2", lessons: [], test: null },
      ],
      finalExam: { id: "exam-1", title: "Final Exam", availableAt: null, questions: [] },
    });
    expect(nextStepAfterModule(course, 0)).toEqual({ type: "exam", quizId: "exam-1", label: "Final Exam" });
  });
});

describe("nextStepAfterQuiz", () => {
  it("returns none for the final exam", () => {
    const course = baseCourse({ finalExam: { id: "exam-1", title: "Final Exam", availableAt: null, questions: [] } });
    expect(nextStepAfterQuiz(course, "exam-1")).toEqual({ type: "none" });
  });

  it("moves to the next module after a module test", () => {
    const course = baseCourse({
      modules: [
        { id: "m1", title: "Module 1", lessons: [], test: { id: "test-1", title: "Test 1", availableAt: null, questions: [] } },
        { id: "m2", title: "Module 2", test: null, lessons: [lesson("l2")] },
      ],
    });
    expect(nextStepAfterQuiz(course, "test-1")).toEqual({
      type: "lesson",
      moduleId: "m2",
      lessonId: "l2",
      label: "Next module: Module 2",
    });
  });

  it("returns none for an unknown quiz id", () => {
    const course = baseCourse();
    expect(nextStepAfterQuiz(course, "nope")).toEqual({ type: "none" });
  });
});

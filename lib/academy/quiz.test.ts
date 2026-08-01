import { describe, expect, it } from "vitest";
import {
  isQuizAvailable,
  scoreQuiz,
  findQuizById,
  toDatetimeLocalValue,
  fromDatetimeLocalValue,
} from "./quiz";
import type { AcademyCourse, Quiz } from "@/lib/db/academy";

function makeQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    id: "quiz-1",
    title: "Module 1 Test",
    availableAt: null,
    questions: [
      { id: "q1", text: "2 + 2?", options: ["3", "4"], correctOptionIndex: 1 },
      { id: "q2", text: "Capital of France?", options: ["Paris", "London"], correctOptionIndex: 0 },
    ],
    ...overrides,
  };
}

describe("isQuizAvailable", () => {
  const now = new Date("2026-06-15T12:00:00.000Z");

  it("is unavailable when there's no quiz", () => {
    expect(isQuizAvailable(undefined, now)).toBe(false);
  });

  it("is unavailable when availableAt was never set", () => {
    expect(isQuizAvailable(makeQuiz({ availableAt: null }), now)).toBe(false);
  });

  it("is unavailable when availableAt is in the future", () => {
    expect(isQuizAvailable(makeQuiz({ availableAt: "2026-06-20T00:00:00.000Z" }), now)).toBe(false);
  });

  it("is available when availableAt has passed", () => {
    expect(isQuizAvailable(makeQuiz({ availableAt: "2026-06-01T00:00:00.000Z" }), now)).toBe(true);
  });

  it("is available exactly at availableAt", () => {
    expect(isQuizAvailable(makeQuiz({ availableAt: now.toISOString() }), now)).toBe(true);
  });
});

describe("scoreQuiz", () => {
  it("scores 100% when every answer is correct", () => {
    expect(scoreQuiz(makeQuiz(), { q1: 1, q2: 0 })).toBe(100);
  });

  it("scores 0% when every answer is wrong", () => {
    expect(scoreQuiz(makeQuiz(), { q1: 0, q2: 1 })).toBe(0);
  });

  it("scores partial credit", () => {
    expect(scoreQuiz(makeQuiz(), { q1: 1, q2: 1 })).toBe(50);
  });

  it("treats a missing answer as wrong", () => {
    expect(scoreQuiz(makeQuiz(), { q1: 1 })).toBe(50);
  });

  it("scores 0% for a quiz with no questions rather than dividing by zero", () => {
    expect(scoreQuiz(makeQuiz({ questions: [] }), {})).toBe(0);
  });
});

describe("findQuizById", () => {
  const course: AcademyCourse = {
    id: "course-1",
    courseId: null,
    slug: "course-1",
    fr: { title: "", description: "" },
    en: { title: "", description: "" },
    enrollmentFeeCents: null,
    finalExam: makeQuiz({ id: "exam-1", title: "Final Exam" }),
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: null,
    modules: [
      { id: "m1", title: "Module 1", lessons: [], test: makeQuiz({ id: "test-1", title: "Module 1 Test" }) },
      { id: "m2", title: "Module 2", lessons: [], test: null },
    ],
  };

  it("finds the final exam", () => {
    expect(findQuizById(course, "exam-1")?.title).toBe("Final Exam");
  });

  it("finds a module test", () => {
    expect(findQuizById(course, "test-1")?.title).toBe("Module 1 Test");
  });

  it("returns undefined for an unknown quiz id", () => {
    expect(findQuizById(course, "nope")).toBeUndefined();
  });

  it("returns undefined when the course itself is undefined", () => {
    expect(findQuizById(undefined, "exam-1")).toBeUndefined();
  });
});

describe("datetime-local conversion", () => {
  it("round-trips through toDatetimeLocalValue/fromDatetimeLocalValue", () => {
    const iso = "2026-08-01T14:30:00.000Z";
    const local = toDatetimeLocalValue(iso);
    expect(fromDatetimeLocalValue(local)).toBe(new Date(local).toISOString());
  });

  it("returns an empty string for null", () => {
    expect(toDatetimeLocalValue(null)).toBe("");
  });

  it("returns null for an empty string", () => {
    expect(fromDatetimeLocalValue("")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import {
  isQuizAvailable,
  scoreMultipleChoice,
  scoreMultipleSelect,
  computeSubmissionScore,
  isSubmissionFullyGraded,
  findQuizById,
  toDatetimeLocalValue,
  fromDatetimeLocalValue,
} from "./quiz";
import type { AcademyCourse, MultipleChoiceQuestion, MultipleSelectQuestion, Quiz, QuizAnswer } from "@/lib/db/academy";

function makeMultipleChoiceQuestion(overrides: Partial<MultipleChoiceQuestion> = {}): MultipleChoiceQuestion {
  return {
    id: "q1",
    type: "multiple_choice",
    text: "2 + 2?",
    options: ["3", "4"],
    correctOptionIndex: 1,
    ...overrides,
  };
}

function makeQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    id: "quiz-1",
    title: "Module 1 Test",
    availableAt: null,
    questions: [
      { id: "q1", type: "multiple_choice", text: "2 + 2?", options: ["3", "4"], correctOptionIndex: 1 },
      {
        id: "q2",
        type: "multiple_choice",
        text: "Capital of France?",
        options: ["Paris", "London"],
        correctOptionIndex: 0,
      },
    ],
    ...overrides,
  };
}

function makeMultipleSelectQuestion(overrides: Partial<MultipleSelectQuestion> = {}): MultipleSelectQuestion {
  return {
    id: "q1",
    type: "multiple_select",
    text: "Which are prime?",
    options: ["2", "3", "4", "6"],
    correctOptionIndexes: [0, 1],
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

describe("scoreMultipleChoice", () => {
  const question = makeMultipleChoiceQuestion();

  it("scores 100 when the selected option matches", () => {
    expect(scoreMultipleChoice(question, 1)).toBe(100);
  });

  it("scores 0 when the selected option is wrong", () => {
    expect(scoreMultipleChoice(question, 0)).toBe(0);
  });

  it("treats a missing answer as wrong", () => {
    expect(scoreMultipleChoice(question, null)).toBe(0);
  });
});

describe("scoreMultipleSelect", () => {
  const question = makeMultipleSelectQuestion();

  it("scores 100 for an exact match", () => {
    expect(scoreMultipleSelect(question, [0, 1])).toBe(100);
  });

  it("scores 100 for an exact match regardless of order", () => {
    expect(scoreMultipleSelect(question, [1, 0])).toBe(100);
  });

  it("scores 0 for a subset of the correct answers", () => {
    expect(scoreMultipleSelect(question, [0])).toBe(0);
  });

  it("scores 0 for a superset that includes a wrong option", () => {
    expect(scoreMultipleSelect(question, [0, 1, 2])).toBe(0);
  });

  it("scores 0 for an entirely wrong selection", () => {
    expect(scoreMultipleSelect(question, [2, 3])).toBe(0);
  });

  it("scores 0 for an empty selection", () => {
    expect(scoreMultipleSelect(question, [])).toBe(0);
  });

  it("scores 0 for a null selection", () => {
    expect(scoreMultipleSelect(question, null)).toBe(0);
  });
});

describe("computeSubmissionScore", () => {
  it("averages each answer's scorePercent", () => {
    expect(computeSubmissionScore([{ scorePercent: 100 }, { scorePercent: 0 }])).toBe(50);
  });

  it("rounds to the nearest whole percent", () => {
    expect(computeSubmissionScore([{ scorePercent: 100 }, { scorePercent: 100 }, { scorePercent: 0 }])).toBe(67);
  });

  it("scores 0 for a submission with no answers rather than dividing by zero", () => {
    expect(computeSubmissionScore([])).toBe(0);
  });
});

describe("isSubmissionFullyGraded", () => {
  function makeAnswer(overrides: Partial<Pick<QuizAnswer, "aiGradingStatus" | "reviewStatus">> = {}) {
    return { aiGradingStatus: "not_applicable" as const, reviewStatus: "not_applicable" as const, ...overrides };
  }

  it("is true when every answer is resolved", () => {
    expect(
      isSubmissionFullyGraded([makeAnswer(), makeAnswer({ aiGradingStatus: "graded", reviewStatus: "approved" })])
    ).toBe(true);
  });

  it("is false while any answer is awaiting AI grading", () => {
    expect(isSubmissionFullyGraded([makeAnswer(), makeAnswer({ aiGradingStatus: "pending", reviewStatus: "pending" })])).toBe(
      false
    );
  });

  it("is false while any answer is awaiting teacher review", () => {
    expect(
      isSubmissionFullyGraded([makeAnswer(), makeAnswer({ aiGradingStatus: "graded", reviewStatus: "pending" })])
    ).toBe(false);
  });

  it("is false while any answer's AI grading failed (still needs manual review)", () => {
    expect(isSubmissionFullyGraded([makeAnswer({ aiGradingStatus: "failed", reviewStatus: "pending" })])).toBe(false);
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

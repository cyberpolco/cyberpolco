import { describe, expect, it } from "vitest";
import { progressPercent, totalLessons, type AcademyCourse, type AcademyEnrollment } from "./academy";

function makeCourse(lessonsPerModule: number[]): AcademyCourse {
  return {
    id: "course-1",
    slug: "course-1",
    fr: { title: "Cours", description: "" },
    en: { title: "Course", description: "" },
    createdAt: "2026-01-01T00:00:00.000Z",
    modules: lessonsPerModule.map((count, mIndex) => ({
      id: `module-${mIndex}`,
      title: `Module ${mIndex}`,
      lessons: Array.from({ length: count }, (_, lIndex) => ({
        id: `m${mIndex}-l${lIndex}`,
        title: `Lesson ${lIndex}`,
        description: "",
        materialUrl: null,
        materialFileName: null,
      })),
    })),
  };
}

function makeEnrollment(completedLessonIds: string[]): AcademyEnrollment {
  return {
    id: "enrollment-1",
    studentId: "ACD-0001",
    studentName: "Jane Doe",
    email: "jane@example.com",
    phone: "+264 81 123 4567",
    courseId: "course-1",
    completedLessonIds,
    certificateIssued: false,
    certificateFileUrl: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("totalLessons", () => {
  it("sums lessons across all modules", () => {
    expect(totalLessons(makeCourse([2, 3, 1]))).toBe(6);
  });

  it("returns 0 for an undefined course", () => {
    expect(totalLessons(undefined)).toBe(0);
  });

  it("returns 0 for a course with no modules", () => {
    expect(totalLessons(makeCourse([]))).toBe(0);
  });
});

describe("progressPercent", () => {
  it("computes the rounded percentage of completed lessons", () => {
    const course = makeCourse([2, 2]); // 4 lessons total: m0-l0, m0-l1, m1-l0, m1-l1
    const enrollment = makeEnrollment(["m0-l0"]);
    expect(progressPercent(enrollment, course)).toBe(25);
  });

  it("returns 100 when every lesson is completed", () => {
    const course = makeCourse([2]);
    const enrollment = makeEnrollment(["m0-l0", "m0-l1"]);
    expect(progressPercent(enrollment, course)).toBe(100);
  });

  it("returns 0 when the course has no lessons (avoids divide-by-zero)", () => {
    const course = makeCourse([]);
    const enrollment = makeEnrollment([]);
    expect(progressPercent(enrollment, course)).toBe(0);
  });

  it("returns 0 when the course is undefined", () => {
    expect(progressPercent(makeEnrollment([]), undefined)).toBe(0);
  });
});

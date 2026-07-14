import { describe, expect, it } from "vitest";
import { computeAcademyStats, progressPercent, totalLessons, type AcademyCourse, type AcademyEnrollment } from "./academy";

function makeCourse(lessonsPerModule: number[], overrides: Partial<AcademyCourse> = {}): AcademyCourse {
  return {
    id: "course-1",
    slug: "course-1",
    fr: { title: "Cours", description: "" },
    en: { title: "Course", description: "" },
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
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

function makeEnrollment(
  completedLessonIds: string[],
  overrides: Partial<AcademyEnrollment> = {}
): AcademyEnrollment {
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
    ...overrides,
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

describe("computeAcademyStats", () => {
  it("returns all-zero stats with no courses or enrollments", () => {
    const stats = computeAcademyStats([], []);
    expect(stats).toEqual({
      totalCourses: 0,
      totalStudents: 0,
      certificatesIssued: 0,
      averageProgress: 0,
      enrollmentsByCourse: [],
    });
  });

  it("counts courses, students, and certificates", () => {
    const courseA = makeCourse([2], { id: "a", slug: "a", en: { title: "Course A", description: "" } });
    const courseB = makeCourse([2], { id: "b", slug: "b", en: { title: "Course B", description: "" } });
    const enrollments = [
      makeEnrollment([], { id: "e1", courseId: "a", certificateIssued: true }),
      makeEnrollment([], { id: "e2", courseId: "a", certificateIssued: false }),
      makeEnrollment([], { id: "e3", courseId: "b", certificateIssued: false }),
    ];

    const stats = computeAcademyStats([courseA, courseB], enrollments);

    expect(stats.totalCourses).toBe(2);
    expect(stats.totalStudents).toBe(3);
    expect(stats.certificatesIssued).toBe(1);
  });

  it("averages progress across all enrollments", () => {
    const course = makeCourse([2]); // 2 lessons total
    const enrollments = [
      makeEnrollment(["m0-l0", "m0-l1"], { id: "e1" }), // 100%
      makeEnrollment([], { id: "e2" }), // 0%
    ];

    expect(computeAcademyStats([course], enrollments).averageProgress).toBe(50);
  });

  it("ranks enrollmentsByCourse by count, descending, including zero-enrollment courses", () => {
    const popular = makeCourse([1], { id: "popular", slug: "popular", en: { title: "Popular", description: "" } });
    const quiet = makeCourse([1], { id: "quiet", slug: "quiet", en: { title: "Quiet", description: "" } });
    const empty = makeCourse([1], { id: "empty", slug: "empty", en: { title: "Empty", description: "" } });

    const enrollments = [
      makeEnrollment([], { id: "e1", courseId: "popular" }),
      makeEnrollment([], { id: "e2", courseId: "popular" }),
      makeEnrollment([], { id: "e3", courseId: "quiet" }),
    ];

    const stats = computeAcademyStats([popular, quiet, empty], enrollments);

    expect(stats.enrollmentsByCourse).toEqual([
      { label: "Popular", value: 2 },
      { label: "Quiet", value: 1 },
      { label: "Empty", value: 0 },
    ]);
  });
});

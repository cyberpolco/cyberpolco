import { eq } from "drizzle-orm";
import { db } from "./client";
import { academyCourses as academyCoursesTable, academyEnrollments as academyEnrollmentsTable } from "./schema";

export type Lesson = {
  id: string;
  title: string;
  description: string;
  materialUrl: string | null;
  materialFileName: string | null;
};
export type Module = { id: string; title: string; lessons: Lesson[] };
export type LocalizedCourseText = { title: string; description: string };

export type AcademyCourse = {
  id: string;
  slug: string;
  fr: LocalizedCourseText;
  en: LocalizedCourseText;
  modules: Module[];
  createdAt: string;
};

export type AcademyEnrollment = {
  id: string;
  studentId: string;
  studentName: string;
  email: string;
  phone: string;
  courseId: string;
  completedLessonIds: string[];
  certificateIssued: boolean;
  certificateFileUrl: string | null;
  createdAt: string;
};

export async function getAcademyCourses(): Promise<AcademyCourse[]> {
  return db.select().from(academyCoursesTable);
}

export async function getAcademyCourseById(id: string): Promise<AcademyCourse | undefined> {
  const [row] = await db.select().from(academyCoursesTable).where(eq(academyCoursesTable.id, id));
  return row;
}

export async function getAcademyCourseBySlug(slug: string): Promise<AcademyCourse | undefined> {
  const [row] = await db.select().from(academyCoursesTable).where(eq(academyCoursesTable.slug, slug));
  return row;
}

export async function saveAcademyCourse(course: AcademyCourse): Promise<void> {
  await db
    .insert(academyCoursesTable)
    .values(course)
    .onConflictDoUpdate({ target: academyCoursesTable.id, set: course });
}

export async function deleteAcademyCourse(id: string): Promise<void> {
  await db.delete(academyCoursesTable).where(eq(academyCoursesTable.id, id));
}

export async function getAcademyEnrollments(): Promise<AcademyEnrollment[]> {
  return db.select().from(academyEnrollmentsTable);
}

export async function getAcademyEnrollmentById(id: string): Promise<AcademyEnrollment | undefined> {
  const [row] = await db
    .select()
    .from(academyEnrollmentsTable)
    .where(eq(academyEnrollmentsTable.id, id));
  return row;
}

export async function saveAcademyEnrollment(enrollment: AcademyEnrollment): Promise<void> {
  await db
    .insert(academyEnrollmentsTable)
    .values(enrollment)
    .onConflictDoUpdate({ target: academyEnrollmentsTable.id, set: enrollment });
}

export async function deleteAcademyEnrollment(id: string): Promise<void> {
  await db.delete(academyEnrollmentsTable).where(eq(academyEnrollmentsTable.id, id));
}

export async function getNextStudentId(): Promise<string> {
  const rows = await db.select({ id: academyEnrollmentsTable.id }).from(academyEnrollmentsTable);
  return `ACD-${String(rows.length + 1).padStart(4, "0")}`;
}

export function totalLessons(course: AcademyCourse | undefined): number {
  if (!course) return 0;
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

export function progressPercent(
  enrollment: AcademyEnrollment,
  course: AcademyCourse | undefined
): number {
  const total = totalLessons(course);
  if (total === 0) return 0;
  return Math.round((enrollment.completedLessonIds.length / total) * 100);
}

export type AcademyStats = {
  totalCourses: number;
  totalStudents: number;
  certificatesIssued: number;
  averageProgress: number;
  enrollmentsByCourse: { label: string; value: number }[];
};

export function computeAcademyStats(
  courses: AcademyCourse[],
  enrollments: AcademyEnrollment[]
): AcademyStats {
  const courseById = new Map(courses.map((c) => [c.id, c]));

  const progressValues = enrollments.map((e) => progressPercent(e, courseById.get(e.courseId)));
  const averageProgress = progressValues.length
    ? Math.round(progressValues.reduce((sum, p) => sum + p, 0) / progressValues.length)
    : 0;

  const enrollmentCounts = new Map<string, number>();
  for (const e of enrollments) {
    enrollmentCounts.set(e.courseId, (enrollmentCounts.get(e.courseId) ?? 0) + 1);
  }

  const enrollmentsByCourse = courses
    .map((c) => ({ label: c.en.title, value: enrollmentCounts.get(c.id) ?? 0 }))
    .sort((a, b) => b.value - a.value);

  return {
    totalCourses: courses.length,
    totalStudents: enrollments.length,
    certificatesIssued: enrollments.filter((e) => e.certificateIssued).length,
    averageProgress,
    enrollmentsByCourse,
  };
}

export async function getAcademyStats(): Promise<AcademyStats> {
  const [courses, enrollments] = await Promise.all([getAcademyCourses(), getAcademyEnrollments()]);
  return computeAcademyStats(courses, enrollments);
}

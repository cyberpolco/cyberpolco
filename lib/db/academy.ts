import { eq } from "drizzle-orm";
import { db } from "./client";
import { academyCourses as academyCoursesTable, academyEnrollments as academyEnrollmentsTable } from "./schema";

export type Lesson = { id: string; title: string; description: string };
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

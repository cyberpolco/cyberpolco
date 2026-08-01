import { eq } from "drizzle-orm";
import { db } from "./client";
import { academyCourses as academyCoursesTable, academyEnrollments as academyEnrollmentsTable } from "./schema";
import { progressPercent } from "@/lib/academy/progress";

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
  courseId: string | null;
  slug: string;
  fr: LocalizedCourseText;
  en: LocalizedCourseText;
  modules: Module[];
  enrollmentFeeCents: number | null;
  createdAt: string;
  createdBy: string | null;
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
  feePaid: boolean;
  feePaidAt: string | null;
  createdAt: string;
  createdBy: string | null;
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

export async function getEnrollmentByStudentId(studentId: string): Promise<AcademyEnrollment | undefined> {
  const [row] = await db
    .select()
    .from(academyEnrollmentsTable)
    .where(eq(academyEnrollmentsTable.studentId, studentId));
  return row;
}

/** One row per distinct student (deduped from possibly-many course rows), for the "existing student" picker. */
export async function getDistinctStudents(): Promise<
  Pick<AcademyEnrollment, "studentId" | "studentName" | "email" | "phone">[]
> {
  const enrollments = await getAcademyEnrollments();
  const seen = new Map<string, AcademyEnrollment>();
  for (const e of enrollments) {
    if (!seen.has(e.studentId)) seen.set(e.studentId, e);
  }
  return Array.from(seen.values()).map(({ studentId, studentName, email, phone }) => ({
    studentId,
    studentName,
    email,
    phone,
  }));
}

export async function saveAcademyEnrollment(enrollment: AcademyEnrollment): Promise<void> {
  await db
    .insert(academyEnrollmentsTable)
    .values(enrollment)
    .onConflictDoUpdate({ target: academyEnrollmentsTable.id, set: enrollment });
}

export async function markEnrollmentFeePaid(id: string): Promise<void> {
  await db
    .update(academyEnrollmentsTable)
    .set({ feePaid: true, feePaidAt: new Date().toISOString() })
    .where(eq(academyEnrollmentsTable.id, id));
}

export async function deleteAcademyEnrollment(id: string): Promise<void> {
  await db.delete(academyEnrollmentsTable).where(eq(academyEnrollmentsTable.id, id));
}

/**
 * CPCYYFDDLNNN — YY/DD are the registration year/day (today), F/L are the
 * first letters of the student's first/last name, and NNN is the next
 * available multiple of 3 among existing students sharing that exact
 * YY+F+DD+L combination (see docs/student-id-spec).
 */
export async function getNextStudentId(firstName: string, lastName: string): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear() % 100).padStart(2, "0");
  const f = firstName.trim().charAt(0).toUpperCase();
  const dd = String(now.getDate()).padStart(2, "0");
  const l = lastName.trim().charAt(0).toUpperCase();
  const prefix = `CPC${yy}${f}${dd}${l}`;

  const rows = await db.select({ studentId: academyEnrollmentsTable.studentId }).from(academyEnrollmentsTable);
  let max = 0;
  for (const { studentId } of rows) {
    if (!studentId.startsWith(prefix)) continue;
    const seq = Number(studentId.slice(prefix.length));
    if (!Number.isNaN(seq) && seq > max) max = seq;
  }

  // Round up to the next multiple of 3 rather than adding 3 outright, since
  // `max` may be a leftover multiple of 7 from before the switch to 3.
  const next = (Math.floor(max / 3) + 1) * 3;
  if (next > 999) throw new Error(`No Student ID sequence left for ${prefix} today — all 333 slots are used.`);
  return `${prefix}${String(next).padStart(3, "0")}`;
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

"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { needsApproval } from "@/lib/auth/approval";
import { addPendingChange } from "@/lib/db/pending-changes";
import {
  saveAcademyCourse,
  getAcademyCourseById,
  deleteAcademyCourse,
  saveAcademyEnrollment,
  deleteAcademyEnrollment,
  getAcademyEnrollmentById,
  getEnrollmentByStudentId,
  getEnrollmentsByStudentId,
  getNextStudentId,
  markEnrollmentFeePaid,
  type AcademyCourse,
  type AcademyEnrollment,
  type Module,
  type Lesson,
} from "@/lib/db/academy";
import { isValidCourseIdPrefix } from "@/lib/content/academy-options";
import { parseUsdToCents } from "@/lib/content/money";
import { progressPercent } from "@/lib/academy/progress";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "");
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseModules(formData: FormData): Module[] {
  const moduleCount = Number(formData.get("moduleCount") || 0);
  const modules: Module[] = [];

  for (let i = 0; i < moduleCount; i++) {
    const lessonCount = Number(formData.get(`module_${i}_lessonCount`) || 0);
    const lessons: Lesson[] = [];

    for (let j = 0; j < lessonCount; j++) {
      lessons.push({
        id: field(formData, `module_${i}_lesson_${j}_id`) || crypto.randomUUID(),
        title: field(formData, `module_${i}_lesson_${j}_title`),
        description: field(formData, `module_${i}_lesson_${j}_description`),
        materialUrl: field(formData, `module_${i}_lesson_${j}_materialUrl`) || null,
        materialFileName: field(formData, `module_${i}_lesson_${j}_materialFileName`) || null,
      });
    }

    modules.push({
      id: field(formData, `module_${i}_id`) || crypto.randomUUID(),
      title: field(formData, `module_${i}_title`),
      lessons,
    });
  }

  return modules;
}

export async function upsertAcademyCourseAction(formData: FormData) {
  const session = await requireRole(["super_admin", "teacher"]);

  const existingId = field(formData, "id");
  const existingSlug = field(formData, "existingSlug");
  const titleFr = field(formData, "title_fr");
  const titleEn = field(formData, "title_en");
  const slug = existingSlug || slugify(titleEn || titleFr);
  // Source createdAt/createdBy from the DB record, not the submitted form —
  // see the identical comment in lib/actions/starlink.ts.
  const existing = existingId ? await getAcademyCourseById(existingId) : undefined;

  // The Course ID (4-letter prefix + creation year) is assigned once and
  // never regenerated. Only a super_admin may set the prefix — a teacher
  // submitting one is ignored, not just hidden in the UI.
  let courseId = existing?.courseId ?? null;
  if (!courseId && session.role === "super_admin") {
    const prefix = field(formData, "courseIdPrefix").toUpperCase();
    if (prefix) {
      if (!isValidCourseIdPrefix(prefix)) {
        throw new Error(`Invalid Course ID "${prefix}" — expected exactly 4 letters.`);
      }
      const yy = String(new Date().getFullYear() % 100).padStart(2, "0");
      courseId = `${prefix}${yy}`;
    }
  }

  // Enrollment fee: super_admin-only, same rule as the Course ID prefix
  // above — a teacher's submitted value is ignored, not just hidden in the UI.
  let enrollmentFeeCents = existing?.enrollmentFeeCents ?? null;
  if (session.role === "super_admin") {
    const rawFee = field(formData, "enrollmentFeeUsd").trim();
    if (rawFee) {
      const cents = parseUsdToCents(rawFee);
      if (cents === null) {
        throw new Error(`Invalid enrollment fee "${rawFee}" — expected a USD amount like 49.99.`);
      }
      enrollmentFeeCents = cents;
    }
  }

  const course: AcademyCourse = {
    id: existingId || crypto.randomUUID(),
    courseId,
    slug,
    fr: { title: titleFr, description: field(formData, "description_fr") },
    en: { title: titleEn, description: field(formData, "description_en") },
    modules: parseModules(formData),
    enrollmentFeeCents,
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    createdBy: existing ? existing.createdBy : session.userId,
  };

  if (
    existing &&
    needsApproval({ existingRecord: existing, sessionUserId: session.userId, sessionRole: session.role })
  ) {
    await addPendingChange({
      targetTable: "academy_course",
      targetId: existing.id,
      proposedData: course,
      proposedBy: session.userId,
    });
    redirect("/admin/academy/courses?pending=1");
  }

  await saveAcademyCourse(course);
  revalidatePath("/admin/academy/courses");
  redirect("/admin/academy/courses");
}

export async function deleteAcademyCourseAction(formData: FormData) {
  await requireRole(["super_admin"]);

  const id = field(formData, "id");
  await deleteAcademyCourse(id);
  revalidatePath("/admin/academy/courses");
}

export async function createEnrollmentAction(formData: FormData) {
  const session = await requireRole(["super_admin", "teacher"]);

  // "Existing student" mode reuses an already-registered student's identity
  // (id/name/email/phone) so the same person can be enrolled in more than one
  // course without minting a second Student ID. That identity is looked up
  // from the DB, not trusted from the form, same reasoning as
  // createdAt/createdBy above.
  const existingStudentId = field(formData, "existingStudentId");
  let identity: Pick<AcademyEnrollment, "studentId" | "studentName" | "email" | "phone">;

  if (existingStudentId) {
    const existing = await getEnrollmentByStudentId(existingStudentId);
    if (!existing) throw new Error(`Unknown Student ID "${existingStudentId}".`);
    identity = existing;
  } else {
    const firstName = field(formData, "firstName");
    const lastName = field(formData, "lastName");
    identity = {
      studentId: await getNextStudentId(firstName, lastName),
      studentName: `${firstName} ${lastName}`.trim(),
      email: field(formData, "email"),
      phone: field(formData, "phone"),
    };
  }

  const enrollment: AcademyEnrollment = {
    id: crypto.randomUUID(),
    ...identity,
    courseId: field(formData, "courseId"),
    completedLessonIds: [],
    certificateIssued: false,
    certificateFileUrl: null,
    feePaid: false,
    feePaidAt: null,
    createdAt: new Date().toISOString(),
    createdBy: session.userId,
  };

  await saveAcademyEnrollment(enrollment);
  revalidatePath("/admin/academy/students");
  redirect("/admin/academy/students");
}

export async function deleteEnrollmentAction(formData: FormData) {
  await requireRole(["super_admin"]);

  const id = field(formData, "id");
  await deleteAcademyEnrollment(id);
  revalidatePath("/admin/academy/students");
}

export async function updateEnrollmentProgressAction(formData: FormData) {
  const session = await requireRole(["super_admin", "teacher"]);

  const id = field(formData, "id");
  const enrollment = await getAcademyEnrollmentById(id);
  if (!enrollment) redirect("/admin/academy/students");

  // Lesson completion is self-reported by the student (see
  // updateOwnProgressAction) — this action can no longer touch it, only
  // award a certificate, and only once that self-reported progress hits
  // 100%. Enforced here, not just hidden in the UI.
  const course = await getAcademyCourseById(enrollment.courseId);
  const isComplete = progressPercent(enrollment, course) === 100;

  const certificateIssued = isComplete && formData.get("certificateIssued") === "on";
  const certificateFileUrl = isComplete
    ? field(formData, "certificateFileUrl") || enrollment.certificateFileUrl
    : enrollment.certificateFileUrl;

  const updated: AcademyEnrollment = {
    ...enrollment,
    certificateIssued,
    certificateFileUrl,
  };

  if (
    needsApproval({ existingRecord: enrollment, sessionUserId: session.userId, sessionRole: session.role })
  ) {
    await addPendingChange({
      targetTable: "academy_enrollment",
      targetId: enrollment.id,
      proposedData: updated,
      proposedBy: session.userId,
    });
    redirect(`/admin/academy/students/${id}?pending=1`);
  }

  await saveAcademyEnrollment(updated);

  revalidatePath(`/admin/academy/students/${id}`);
  revalidatePath("/admin/academy/students");
  redirect(`/admin/academy/students/${id}`);
}

// Resolves the enrollment record behind a viewer session — a student can
// have several enrollment rows (one per course, see getNextStudentId), but
// users.linkedId only points at one of them. Every self-service action below
// uses the returned studentId to verify a submitted enrollmentId/courseId
// actually belongs to the caller before touching it, instead of trusting
// the form.
async function requireOwnEnrollment(session: {
  viewerType?: string | null;
  linkedId?: string | null;
}): Promise<AcademyEnrollment> {
  if (session.viewerType !== "academy_student" || !session.linkedId) redirect("/admin/dashboard");
  const linkedEnrollment = await getAcademyEnrollmentById(session.linkedId);
  if (!linkedEnrollment) redirect("/admin/dashboard");
  return linkedEnrollment;
}

// Self-service, honor-system payment: the student clicks "Pay" and their own
// enrollment (verified via requireOwnEnrollment, never trusted from the form
// alone) is immediately marked paid.
export async function payEnrollmentFeeAction(formData: FormData) {
  const session = await requireRole(["viewer"]);
  const { studentId } = await requireOwnEnrollment(session);

  const enrollment = await getAcademyEnrollmentById(field(formData, "enrollmentId"));
  if (!enrollment || enrollment.studentId !== studentId) redirect("/admin/academy/my-courses");

  await markEnrollmentFeePaid(enrollment.id);
  revalidatePath("/admin/academy/my-courses");
  revalidatePath("/admin/dashboard");
  redirect("/admin/academy/my-courses");
}

// Lesson completion is entirely self-reported — no admin approval, no
// certificate-style review. Blocked if the course has an unpaid enrollment
// fee, mirroring the material-link lock on the same page.
export async function updateOwnProgressAction(formData: FormData) {
  const session = await requireRole(["viewer"]);
  const { studentId } = await requireOwnEnrollment(session);

  const enrollment = await getAcademyEnrollmentById(field(formData, "enrollmentId"));
  if (!enrollment || enrollment.studentId !== studentId) redirect("/admin/academy/my-courses");

  const course = await getAcademyCourseById(enrollment.courseId);
  const feeCents = course?.enrollmentFeeCents ?? 0;
  if (feeCents > 0 && !enrollment.feePaid) redirect("/admin/academy/my-courses");

  const lessonId = field(formData, "lessonId");
  const completed = field(formData, "completed") === "true";
  const completedLessonIds = completed
    ? Array.from(new Set([...enrollment.completedLessonIds, lessonId]))
    : enrollment.completedLessonIds.filter((existingId) => existingId !== lessonId);

  await saveAcademyEnrollment({ ...enrollment, completedLessonIds });
  revalidatePath("/admin/academy/my-courses");
  revalidatePath("/admin/academy/progress");
  revalidatePath("/admin/dashboard");
  redirect("/admin/academy/my-courses");
}

// A student enrolling themselves in another available course reuses their
// existing identity (name/email/phone from their own linked enrollment) —
// never a name/email typed into the form — since they already have a
// Student ID and shouldn't be able to mint a second identity for themselves.
export async function selfEnrollAction(formData: FormData) {
  const session = await requireRole(["viewer"]);
  const identity = await requireOwnEnrollment(session);

  const courseId = field(formData, "courseId");
  const course = await getAcademyCourseById(courseId);
  if (!course) redirect("/admin/academy/my-courses");

  const existing = await getEnrollmentsByStudentId(identity.studentId);
  if (existing.some((e) => e.courseId === courseId)) redirect("/admin/academy/my-courses");

  const enrollment: AcademyEnrollment = {
    id: crypto.randomUUID(),
    studentId: identity.studentId,
    studentName: identity.studentName,
    email: identity.email,
    phone: identity.phone,
    courseId,
    completedLessonIds: [],
    certificateIssued: false,
    certificateFileUrl: null,
    feePaid: false,
    feePaidAt: null,
    createdAt: new Date().toISOString(),
    createdBy: session.userId,
  };

  await saveAcademyEnrollment(enrollment);
  revalidatePath("/admin/academy/my-courses");
  revalidatePath("/admin/dashboard");
  redirect("/admin/academy/my-courses");
}

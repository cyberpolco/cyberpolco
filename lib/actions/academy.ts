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
  getNextStudentId,
  markEnrollmentFeePaid,
  type AcademyCourse,
  type AcademyEnrollment,
  type Module,
  type Lesson,
} from "@/lib/db/academy";
import { isValidCourseIdPrefix } from "@/lib/content/academy-options";
import { parseUsdToCents } from "@/lib/content/money";

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

  const lessonIds = field(formData, "lessonIds").split(",").filter(Boolean);
  const completedLessonIds = lessonIds.filter((lessonId) => formData.get(`lesson_${lessonId}`) === "on");
  const certificateIssued = formData.get("certificateIssued") === "on";

  const certificateFileUrl = field(formData, "certificateFileUrl") || enrollment.certificateFileUrl;

  const updated: AcademyEnrollment = {
    ...enrollment,
    completedLessonIds,
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

// Self-service, honor-system payment: the student clicks "Pay" and their own
// enrollment (identified from the session, never a submitted form field, so
// a student can't pay off someone else's fee) is immediately marked paid.
export async function payEnrollmentFeeAction() {
  const session = await requireRole(["viewer"]);
  if (session.viewerType !== "academy_student" || !session.linkedId) redirect("/admin/dashboard");

  await markEnrollmentFeePaid(session.linkedId);
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}

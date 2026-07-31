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
  getNextStudentId,
  type AcademyCourse,
  type AcademyEnrollment,
  type Module,
  type Lesson,
} from "@/lib/db/academy";

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

  const course: AcademyCourse = {
    id: existingId || crypto.randomUUID(),
    slug,
    fr: { title: titleFr, description: field(formData, "description_fr") },
    en: { title: titleEn, description: field(formData, "description_en") },
    modules: parseModules(formData),
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

  const enrollment: AcademyEnrollment = {
    id: crypto.randomUUID(),
    studentId: await getNextStudentId(),
    studentName: field(formData, "studentName"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    courseId: field(formData, "courseId"),
    completedLessonIds: [],
    certificateIssued: false,
    certificateFileUrl: null,
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

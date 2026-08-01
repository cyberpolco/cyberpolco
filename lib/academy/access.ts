import { redirect } from "next/navigation";
import { getAcademyEnrollmentById, type AcademyEnrollment } from "@/lib/db/academy";
import type { SessionPayload } from "@/lib/auth/session";

// Shared by every page under /admin/academy/my-courses/[enrollmentId]/... —
// resolves the requested enrollment and verifies it actually belongs to the
// signed-in student (matched by studentId, since users.linkedId only points
// at one of a student's possibly-several enrollment rows), never trusting
// the enrollmentId route param on its own.
export async function requireOwnEnrollmentPage(
  session: SessionPayload | null,
  enrollmentId: string
): Promise<AcademyEnrollment> {
  if (session?.role !== "viewer" || session.viewerType !== "academy_student" || !session.linkedId) {
    redirect("/admin/dashboard");
  }

  const linkedEnrollment = await getAcademyEnrollmentById(session.linkedId);
  if (!linkedEnrollment) redirect("/admin/dashboard");

  const enrollment = await getAcademyEnrollmentById(enrollmentId);
  if (!enrollment || enrollment.studentId !== linkedEnrollment.studentId) redirect("/admin/academy/my-courses");

  return enrollment;
}

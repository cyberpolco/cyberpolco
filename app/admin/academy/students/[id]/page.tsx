import { notFound } from "next/navigation";
import { getAcademyEnrollmentById, getAcademyCourseById } from "@/lib/db/academy";
import { progressPercent } from "@/lib/academy/progress";
import { getUsers } from "@/lib/db/users";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";
import ResetLinkedPasswordButton from "@/app/admin/_components/ResetLinkedPasswordButton";
import StudentProgressForm from "./StudentProgressForm";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["super_admin", "teacher"]);

  const { id } = await params;
  const enrollment = await getAcademyEnrollmentById(id);
  if (!enrollment) notFound();

  const course = await getAcademyCourseById(enrollment.courseId);
  const percent = progressPercent(enrollment, course);

  const users = await getUsers();
  const hasLinkedAccount = users.some((u) => u.linkedId === enrollment.id);

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/academy/students" label="Back to Students" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">{enrollment.studentName}</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        {enrollment.studentId} · {course?.en.title ?? "Unknown course"}
      </p>

      {/* Password reset stays super_admin-only — see the identical comment
          in app/admin/starlink/[id]/edit/page.tsx. */}
      {hasLinkedAccount && session.role === "super_admin" && (
        <div className="mt-6">
          <ResetLinkedPasswordButton linkedId={enrollment.id} />
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
        {!!course?.enrollmentFeeCents && (
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="font-medium text-brand-dark dark:text-white">Enrollment fee</span>
            <span
              className={
                enrollment.feePaid
                  ? "rounded-full bg-status-good/15 px-2.5 py-0.5 text-xs font-semibold text-status-good"
                  : "rounded-full bg-status-warning/15 px-2.5 py-0.5 text-xs font-semibold text-status-warning"
              }
            >
              {enrollment.feePaid ? "Paid" : "Unpaid"}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-brand-dark dark:text-white">Progress</span>
          <span className="text-brand-gray dark:text-white/60">{percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div className="h-full rounded-full bg-brand-blue" style={{ width: `${percent}%` }} />
        </div>

        <StudentProgressForm
          enrollmentId={enrollment.id}
          modules={course?.modules ?? []}
          completedLessonIds={enrollment.completedLessonIds}
          isComplete={percent === 100}
          certificateIssued={enrollment.certificateIssued}
          certificateFileUrl={enrollment.certificateFileUrl}
        />
      </div>
    </div>
  );
}

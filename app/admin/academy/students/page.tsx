import Link from "next/link";
import { Plus } from "lucide-react";
import { getAcademyEnrollments, getAcademyCourses } from "@/lib/db/academy";
import { getPendingChanges } from "@/lib/db/pending-changes";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";
import StudentsTable from "@/app/admin/academy/students/_components/StudentsTable";

export default async function AcademyStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  const session = await requireRole(["super_admin", "teacher"]);
  const { pending } = await searchParams;

  const [enrollments, courses, pendingChanges] = await Promise.all([
    getAcademyEnrollments(),
    getAcademyCourses(),
    getPendingChanges("pending"),
  ]);
  const pendingTargetIds = new Set(
    pendingChanges.filter((c) => c.targetTable === "academy_enrollment").map((c) => c.targetId)
  );

  return (
    <div>
      <BackLink href="/admin/academy" label="Back to Academy" />

      {pending === "1" && (
        <div className="mt-4 rounded-xl bg-brand-blue/10 p-4 text-sm text-brand-dark dark:text-white">
          Your changes have been submitted for super_admin approval.
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Students</h1>
        <Link
          href="/admin/academy/students/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New student
        </Link>
      </div>

      <div className="mt-6">
        <StudentsTable
          enrollments={enrollments}
          courses={courses}
          pendingTargetIds={pendingTargetIds}
          canDelete={session.role === "super_admin"}
        />
      </div>
    </div>
  );
}

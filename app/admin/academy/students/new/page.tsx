import { getAcademyCourses } from "@/lib/db/academy";
import { requireRole } from "@/lib/auth/rbac";
import EnrollmentForm from "@/app/admin/academy/students/_components/EnrollmentForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function NewEnrollmentPage() {
  await requireRole(["super_admin"]);

  const courses = await getAcademyCourses();

  return (
    <div>
      <BackLink href="/admin/academy/students" label="Back to Students" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">New student</h1>
      {courses.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          Create a course first before enrolling students.
        </p>
      ) : (
        <div className="mt-6 max-w-lg">
          <EnrollmentForm courses={courses} />
        </div>
      )}
    </div>
  );
}

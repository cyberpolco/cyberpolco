import { requireRole } from "@/lib/auth/rbac";
import CourseForm from "@/app/admin/academy/_components/CourseForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function NewCoursePage() {
  const session = await requireRole(["super_admin", "teacher"]);

  return (
    <div>
      <BackLink href="/admin/academy/courses" label="Back to Courses" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">New course</h1>
      <div className="mt-6">
        <CourseForm isSuperAdmin={session.role === "super_admin"} />
      </div>
    </div>
  );
}

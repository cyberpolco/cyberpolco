import { notFound } from "next/navigation";
import { getAcademyCourseById } from "@/lib/db/academy";
import { requireRole } from "@/lib/auth/rbac";
import CourseForm from "@/app/admin/academy/_components/CourseForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["super_admin"]);

  const { id } = await params;
  const course = await getAcademyCourseById(id);
  if (!course) notFound();

  return (
    <div>
      <BackLink href="/admin/academy/courses" label="Back to Courses" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Edit course</h1>
      <div className="mt-6">
        <CourseForm course={course} />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getAcademyCourseById } from "@/lib/db/academy";
import { requireRole } from "@/lib/auth/rbac";
import CourseForm from "@/app/admin/academy/_components/CourseForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["super_admin"]);

  const { id } = await params;
  const { error } = await searchParams;
  const course = await getAcademyCourseById(id);
  if (!course) notFound();

  return (
    <div>
      <BackLink href="/admin/academy/courses" label="Back to Courses" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Edit course</h1>
      <div className="mt-6">
        <CourseForm course={course} error={error} />
      </div>
    </div>
  );
}

import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getAcademyCourses } from "@/lib/db/academy";
import { deleteAcademyCourseAction } from "@/lib/actions/academy";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";

export default async function AcademyCoursesPage() {
  await requireRole(["super_admin"]);

  const courses = await getAcademyCourses();

  return (
    <div>
      <BackLink href="/admin/academy" label="Back to Academy" />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Courses</h1>
        <Link
          href="/admin/academy/courses/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New course
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Title (EN)</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3">Modules</th>
              <th className="px-5 py-3">Lessons</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-t border-black/5 dark:border-white/10">
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">{c.en.title}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.slug}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.modules.length}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                  {c.modules.reduce((n, m) => n + m.lessons.length, 0)}
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/academy/courses/${c.id}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    <form action={deleteAcademyCourseAction}>
                      <input type="hidden" name="id" value={c.id} />
                      <button type="submit" className="text-brand-red">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No courses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

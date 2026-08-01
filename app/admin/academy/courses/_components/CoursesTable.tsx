"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Pencil } from "lucide-react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { deleteAcademyCourseAction } from "@/lib/actions/academy";
import { isValidCourseId } from "@/lib/content/academy-options";
import { formatUsdCents } from "@/lib/content/money";
import type { AcademyCourse } from "@/lib/db/academy";

// Length of a fully-formed course id (3 letters + a letter/digit + 2-digit
// year, e.g. CYBR26) — used to decide when a partial search query has
// "enough" characters to judge as invalid rather than just incomplete.
const COURSE_ID_LENGTH = 6;

export default function CoursesTable({
  courses,
  pendingTargetIds,
  canDelete,
}: {
  courses: AcademyCourse[];
  pendingTargetIds: Set<string>;
  canDelete: boolean;
}) {
  const [query, setQuery] = useState("");

  const q = query.trim().toUpperCase();
  const filtered = q ? courses.filter((c) => (c.courseId ?? "").toUpperCase().includes(q)) : courses;
  const showFormatHint = q.length >= COURSE_ID_LENGTH && !isValidCourseId(q);

  return (
    <div>
      <div className="relative w-full max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray dark:text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Course ID..."
          className="w-full rounded-full border border-black/10 dark:border-white/15 py-2 pl-9 pr-4 text-sm dark:bg-white/5 dark:text-white"
        />
      </div>
      {showFormatHint && (
        <p className="mt-1 text-xs text-brand-red">
          Doesn&apos;t match the Course ID format: 3 letters + a letter/digit + 2-digit year (e.g. CYBR26)
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
              <tr>
                <th className="px-5 py-3">Course ID</th>
                <th className="px-5 py-3">Title (EN)</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3">Modules</th>
                <th className="px-5 py-3">Lessons</th>
                <th className="px-5 py-3">Fee</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-5 py-3 font-mono text-brand-gray dark:text-white/60">{c.courseId ?? "—"}</td>
                  <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                    {c.en.title}
                    {pendingTargetIds.has(c.id) && (
                      <span className="ml-2 rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-semibold text-status-warning">
                        Pending review
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.slug}</td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.modules.length}</td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                    {c.modules.reduce((n, m) => n + m.lessons.length, 0)}
                  </td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                    {c.enrollmentFeeCents ? formatUsdCents(c.enrollmentFeeCents) : "Free"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/academy/courses/${c.id}/edit`} className="text-brand-blue">
                        <Pencil size={16} />
                      </Link>
                      {canDelete && (
                        <DeleteButton
                          action={deleteAcademyCourseAction}
                          id={c.id}
                          confirmTitle="Delete this course?"
                          confirmBody={`"${c.en.title}" and all its modules and lessons will be permanently removed.`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                    {courses.length === 0 ? "No courses yet." : "No courses match that Course ID."}
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

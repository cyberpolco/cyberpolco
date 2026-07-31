"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BadgeCheck } from "lucide-react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { deleteEnrollmentAction } from "@/lib/actions/academy";
import { isValidStudentId } from "@/lib/content/academy-options";
import { progressPercent, type AcademyCourse, type AcademyEnrollment } from "@/lib/db/academy";

// Length of a fully-formed CPCYYFDDLNNN id — used to decide when a partial
// search query has "enough" characters to judge as invalid rather than just
// incomplete.
const STUDENT_ID_LENGTH = 12;

export default function StudentsTable({
  enrollments,
  courses,
  pendingTargetIds,
  canDelete,
}: {
  enrollments: AcademyEnrollment[];
  courses: AcademyCourse[];
  pendingTargetIds: Set<string>;
  canDelete: boolean;
}) {
  const [query, setQuery] = useState("");
  const courseById = new Map(courses.map((c) => [c.id, c]));

  const q = query.trim().toUpperCase();
  const filtered = q ? enrollments.filter((e) => e.studentId.toUpperCase().includes(q)) : enrollments;
  const showFormatHint = q.length >= STUDENT_ID_LENGTH && !isValidStudentId(q);

  return (
    <div>
      <div className="relative w-full max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray dark:text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Student ID..."
          className="w-full rounded-full border border-black/10 dark:border-white/15 py-2 pl-9 pr-4 text-sm dark:bg-white/5 dark:text-white"
        />
      </div>
      {showFormatHint && (
        <p className="mt-1 text-xs text-brand-red">Doesn&apos;t match the Student ID format: CPCYYFDDLNNN (e.g. CPC26J18M007)</p>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
              <tr>
                <th className="px-5 py-3">Student ID</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Progress</th>
                <th className="px-5 py-3">Certificate</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => {
                const course = courseById.get(e.courseId);
                return (
                  <tr key={e.id} className="border-t border-black/5 dark:border-white/10">
                    <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                      {e.studentId}
                      {pendingTargetIds.has(e.id) && (
                        <span className="ml-2 rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-semibold text-status-warning">
                          Pending review
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-brand-gray dark:text-white/60">{e.studentName}</td>
                    <td className="px-5 py-3 text-brand-gray dark:text-white/60">{course?.en.title ?? "—"}</td>
                    <td className="px-5 py-3 text-brand-gray dark:text-white/60">{progressPercent(e, course)}%</td>
                    <td className="px-5 py-3">
                      {e.certificateIssued && <BadgeCheck size={16} className="text-brand-blue" />}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-3">
                        <Link href={`/admin/academy/students/${e.id}`} className="text-brand-blue">
                          View
                        </Link>
                        {canDelete && (
                          <DeleteButton
                            action={deleteEnrollmentAction}
                            id={e.id}
                            confirmTitle="Remove this enrollment?"
                            confirmBody={`${e.studentName}'s enrollment will be permanently removed.`}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                    {enrollments.length === 0 ? "No students enrolled yet." : "No students match that Student ID."}
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

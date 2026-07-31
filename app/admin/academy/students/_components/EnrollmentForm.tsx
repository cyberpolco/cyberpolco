"use client";

import { useState } from "react";
import { createEnrollmentAction } from "@/lib/actions/academy";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import LinkedRecordSearch from "@/app/admin/_components/LinkedRecordSearch";
import type { AcademyCourse } from "@/lib/db/academy";

type ExistingStudent = { studentId: string; studentName: string; email: string; phone: string };

export default function EnrollmentForm({
  courses,
  existingStudents,
}: {
  courses: AcademyCourse[];
  existingStudents: ExistingStudent[];
}) {
  const [mode, setMode] = useState<"new" | "existing">("new");

  return (
    <form
      action={createEnrollmentAction}
      className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6"
    >
      <div className="flex gap-2 rounded-full bg-black/5 dark:bg-white/10 p-1 text-sm font-medium">
        {(["new", "existing"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={
              mode === m
                ? "flex-1 rounded-full bg-brand-blue py-1.5 text-white"
                : "flex-1 rounded-full py-1.5 text-brand-gray dark:text-white/60"
            }
          >
            {m === "new" ? "New student" : "Existing student"}
          </button>
        ))}
      </div>

      {mode === "new" ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">First name</label>
              <input
                name="firstName"
                required
                className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Last name</label>
              <input
                name="lastName"
                required
                className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Phone</label>
            <input
              name="phone"
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
        </>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Student</label>
          <LinkedRecordSearch
            name="existingStudentId"
            emptyLabel="Select a student"
            searchPlaceholder="Search students..."
            items={existingStudents.map((s) => ({
              id: s.studentId,
              primary: s.studentId,
              secondary: s.studentName,
              email: s.email,
            }))}
          />
          <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
            Adds another course under this student&apos;s existing Student ID.
          </p>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Course</label>
        <select name="courseId" required className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white">
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.en.title}
            </option>
          ))}
        </select>
      </div>

      <SubmitButton pendingLabel="Enrolling...">Enroll student</SubmitButton>
    </form>
  );
}

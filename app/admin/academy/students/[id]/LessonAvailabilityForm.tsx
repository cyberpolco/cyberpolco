"use client";

import { useState } from "react";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { updateLessonAvailabilityAction } from "@/lib/actions/academy";
import { toDatetimeLocalValue } from "@/lib/academy/quiz";

export type AvailabilityMode = "default" | "open" | "scheduled" | "locked";

export type AvailabilityRow = {
  lessonId: string;
  title: string;
  // What "default" resolves to for this student, e.g. "Open (self-paced)".
  defaultLabel: string;
  initialMode: AvailabilityMode;
  // The override's ISO date, only meaningful for "scheduled".
  initialAt: string | null;
};

// Field names match what updateLessonAvailabilityAction reads.
export default function LessonAvailabilityForm({
  enrollmentId,
  modules,
}: {
  enrollmentId: string;
  modules: { id: string; title: string; rows: AvailabilityRow[] }[];
}) {
  const [modes, setModes] = useState<Record<string, AvailabilityMode>>(() =>
    Object.fromEntries(modules.flatMap((m) => m.rows.map((r) => [r.lessonId, r.initialMode])))
  );

  if (!modules.some((m) => m.rows.length > 0)) {
    return <p className="mt-3 text-sm text-brand-gray dark:text-white/60">This course has no lessons yet.</p>;
  }

  return (
    <form action={updateLessonAvailabilityAction} className="mt-4 space-y-5">
      <input type="hidden" name="id" value={enrollmentId} />
      {modules.map((m) => (
        <div key={m.id}>
          <p className="text-sm font-semibold text-brand-dark dark:text-white">{m.title}</p>
          <div className="mt-2 space-y-2">
            {m.rows.map((r) => (
              <div key={r.lessonId} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="min-w-0 flex-1 text-brand-gray dark:text-white/60">{r.title}</span>
                <select
                  name={`lesson_${r.lessonId}_mode`}
                  value={modes[r.lessonId]}
                  onChange={(e) => setModes((prev) => ({ ...prev, [r.lessonId]: e.target.value as AvailabilityMode }))}
                  className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 px-2 py-1.5 text-sm text-brand-dark dark:text-white"
                >
                  <option value="default">Default — {r.defaultLabel}</option>
                  <option value="open">Available now</option>
                  <option value="scheduled">Available from…</option>
                  <option value="locked">Locked</option>
                </select>
                {modes[r.lessonId] === "scheduled" && (
                  <input
                    type="datetime-local"
                    name={`lesson_${r.lessonId}_at`}
                    defaultValue={toDatetimeLocalValue(r.initialAt)}
                    required
                    className="rounded-lg border border-black/10 dark:border-white/15 px-2 py-1.5 text-sm dark:bg-white/5 dark:text-white"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <SubmitButton pendingLabel="Saving...">Save availability</SubmitButton>
    </form>
  );
}

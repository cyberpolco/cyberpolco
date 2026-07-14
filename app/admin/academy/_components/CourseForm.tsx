"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { upsertAcademyCourseAction } from "@/lib/actions/academy";
import type { AcademyCourse, Lesson, Module } from "@/lib/db/academy";

type LessonRow = { key: string; lesson?: Lesson };
type ModuleRow = { key: string; module?: Module; lessonRows: LessonRow[] };

export default function CourseForm({ course }: { course?: AcademyCourse }) {
  const moduleCounter = useRef(0);
  const lessonCounter = useRef(0);

  const [modules, setModules] = useState<ModuleRow[]>(() =>
    (course?.modules ?? []).map((m) => ({
      key: m.id,
      module: m,
      lessonRows: m.lessons.map((l) => ({ key: l.id, lesson: l })),
    }))
  );

  function addModule() {
    moduleCounter.current += 1;
    setModules((m) => [...m, { key: `new-module-${moduleCounter.current}`, lessonRows: [] }]);
  }

  function removeModule(key: string) {
    setModules((m) => m.filter((row) => row.key !== key));
  }

  function addLesson(moduleKey: string) {
    lessonCounter.current += 1;
    setModules((m) =>
      m.map((row) =>
        row.key === moduleKey
          ? { ...row, lessonRows: [...row.lessonRows, { key: `new-lesson-${lessonCounter.current}` }] }
          : row
      )
    );
  }

  function removeLesson(moduleKey: string, lessonKey: string) {
    setModules((m) =>
      m.map((row) =>
        row.key === moduleKey
          ? { ...row, lessonRows: row.lessonRows.filter((l) => l.key !== lessonKey) }
          : row
      )
    );
  }

  return (
    <form action={upsertAcademyCourseAction} className="space-y-8">
      {course && <input type="hidden" name="id" value={course.id} />}
      {course && <input type="hidden" name="existingSlug" value={course.slug} />}
      {course && <input type="hidden" name="createdAt" value={course.createdAt} />}
      <input type="hidden" name="moduleCount" value={modules.length} />

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">Français</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Titre</label>
            <input
              name="title_fr"
              defaultValue={course?.fr.title}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Description</label>
            <textarea
              name="description_fr"
              defaultValue={course?.fr.description}
              rows={3}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">English</legend>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Title</label>
            <input
              name="title_en"
              defaultValue={course?.en.title}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Description</label>
            <textarea
              name="description_en"
              defaultValue={course?.en.description}
              rows={3}
              required
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
            />
          </div>
        </fieldset>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-blue">Modules</h2>
          <button
            type="button"
            onClick={addModule}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue"
          >
            <Plus size={16} /> Add module
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {modules.map((row, i) => (
            <div key={row.key} className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-5">
              <input type="hidden" name={`module_${i}_id`} value={row.module?.id ?? ""} />
              <input type="hidden" name={`module_${i}_lessonCount`} value={row.lessonRows.length} />

              <div className="flex items-center gap-3">
                <input
                  name={`module_${i}_title`}
                  defaultValue={row.module?.title}
                  placeholder="Module title"
                  required
                  className="flex-1 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 font-medium dark:bg-white/5 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => removeModule(row.key)}
                  className="text-brand-red"
                  aria-label="Remove module"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-3 border-l-2 border-black/5 dark:border-white/10 pl-4">
                {row.lessonRows.map((lrow, j) => (
                  <div key={lrow.key} className="rounded-xl border border-black/5 dark:border-white/10 p-3">
                    <input
                      type="hidden"
                      name={`module_${i}_lesson_${j}_id`}
                      value={lrow.lesson?.id ?? ""}
                    />
                    <div className="flex items-center gap-2">
                      <input
                        name={`module_${i}_lesson_${j}_title`}
                        defaultValue={lrow.lesson?.title}
                        placeholder="Lesson title"
                        required
                        className="flex-1 rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm dark:bg-white/5 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeLesson(row.key, lrow.key)}
                        className="text-brand-red"
                        aria-label="Remove lesson"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <textarea
                      name={`module_${i}_lesson_${j}_description`}
                      defaultValue={lrow.lesson?.description}
                      placeholder="Description"
                      rows={2}
                      className="mt-2 w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm dark:bg-white/5 dark:text-white"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addLesson(row.key)}
                  className="flex items-center gap-1 text-sm font-medium text-brand-blue"
                >
                  <Plus size={14} /> Add lesson
                </button>
              </div>
            </div>
          ))}
          {modules.length === 0 && (
            <p className="rounded-xl border border-dashed border-black/15 dark:border-white/15 p-6 text-center text-sm text-brand-gray dark:text-white/60">
              No modules yet. Add one above.
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
      >
        {course ? "Save changes" : "Create course"}
      </button>
    </form>
  );
}

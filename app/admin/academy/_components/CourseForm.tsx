"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, FileText, UploadCloud } from "lucide-react";
import { upsertAcademyCourseAction } from "@/lib/actions/academy";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import BlobFileField from "@/app/admin/_components/BlobFileField";
import { COURSE_ID_PREFIX_PATTERN } from "@/lib/content/academy-options";
import type { AcademyCourse, Lesson, Module } from "@/lib/db/academy";

type LessonRow = {
  key: string;
  lesson?: Lesson;
  materialUrl: string;
  materialFileName: string;
};
type ModuleRow = { key: string; module?: Module; lessonRows: LessonRow[] };

export default function CourseForm({
  course,
  isSuperAdmin,
}: {
  course?: AcademyCourse;
  isSuperAdmin: boolean;
}) {
  const creationYY = String(new Date().getFullYear() % 100).padStart(2, "0");
  const moduleCounter = useRef(0);
  const lessonCounter = useRef(0);

  const [modules, setModules] = useState<ModuleRow[]>(() =>
    (course?.modules ?? []).map((m) => ({
      key: m.id,
      module: m,
      lessonRows: m.lessons.map((l) => ({
        key: l.id,
        lesson: l,
        materialUrl: l.materialUrl ?? "",
        materialFileName: l.materialFileName ?? "",
      })),
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
          ? {
              ...row,
              lessonRows: [
                ...row.lessonRows,
                { key: `new-lesson-${lessonCounter.current}`, materialUrl: "", materialFileName: "" },
              ],
            }
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

  function updateLessonMaterial(
    moduleKey: string,
    lessonKey: string,
    update: Partial<Pick<LessonRow, "materialUrl" | "materialFileName">>
  ) {
    setModules((m) =>
      m.map((row) =>
        row.key === moduleKey
          ? {
              ...row,
              lessonRows: row.lessonRows.map((l) => (l.key === lessonKey ? { ...l, ...update } : l)),
            }
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

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Course ID</label>
        {course?.courseId ? (
          <span className="inline-block rounded-full bg-brand-blue/10 px-3 py-1 font-mono text-sm font-semibold text-brand-blue">
            {course.courseId}
          </span>
        ) : isSuperAdmin ? (
          <>
            <div className="flex items-center gap-2">
              <input
                name="courseIdPrefix"
                maxLength={4}
                required
                pattern={COURSE_ID_PREFIX_PATTERN.source}
                title="4 uppercase letters, e.g. CYBR"
                placeholder="CYBR"
                onInput={(e) => {
                  e.currentTarget.value = e.currentTarget.value.toUpperCase();
                }}
                className="w-32 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 uppercase dark:bg-white/5 dark:text-white"
              />
              <span className="text-sm text-brand-gray dark:text-white/60">+ {creationYY} (added automatically)</span>
            </div>
            <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
              4 letters — the creation year is appended automatically and can&apos;t be changed later.
            </p>
          </>
        ) : (
          <p className="text-sm text-brand-gray dark:text-white/60">Not yet assigned — a super admin needs to set it.</p>
        )}
      </div>

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
                    <input
                      type="hidden"
                      name={`module_${i}_lesson_${j}_materialFileName`}
                      value={lrow.materialFileName}
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
                    <div className="mt-2 rounded-lg border border-brand-blue/30 dark:border-brand-blue/40 bg-brand-blue/5 dark:bg-brand-blue/10 p-2.5">
                      {lrow.materialFileName && (
                        <a
                          href={lrow.materialUrl || undefined}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mb-1 inline-flex items-center gap-1 text-xs text-brand-blue hover:underline"
                        >
                          <FileText size={12} /> Current: {lrow.materialFileName}
                        </a>
                      )}
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-blue">
                        <UploadCloud size={14} />
                        Upload material (PDF or PowerPoint)
                      </label>
                      <BlobFileField
                        kind="lesson-material"
                        name={`module_${i}_lesson_${j}_materialUrl`}
                        accept=".pdf,.ppt,.pptx,application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                        value={lrow.materialUrl}
                        onChange={(url) => updateLessonMaterial(row.key, lrow.key, { materialUrl: url })}
                        onFileNameChange={(fileName) =>
                          updateLessonMaterial(row.key, lrow.key, { materialFileName: fileName })
                        }
                        className="mt-1 w-full text-xs text-brand-gray dark:text-white/60"
                      />
                    </div>
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

      <SubmitButton pendingLabel={course ? "Saving..." : "Creating..."}>
        {course ? "Save changes" : "Create course"}
      </SubmitButton>
    </form>
  );
}

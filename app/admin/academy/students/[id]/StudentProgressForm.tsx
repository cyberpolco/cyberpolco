"use client";

import { useState } from "react";
import { CircleCheckBig, Circle, FileText, UploadCloud } from "lucide-react";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import BlobFileField from "@/app/admin/_components/BlobFileField";
import { updateEnrollmentProgressAction } from "@/lib/actions/academy";

type LessonInfo = { id: string; title: string; materialUrl: string | null; materialFileName: string | null };
type ModuleInfo = { id: string; title: string; lessons: LessonInfo[] };

export default function StudentProgressForm({
  enrollmentId,
  modules,
  completedLessonIds,
  isComplete,
  certificateIssued,
  certificateFileUrl,
}: {
  enrollmentId: string;
  modules: ModuleInfo[];
  completedLessonIds: string[];
  isComplete: boolean;
  certificateIssued: boolean;
  certificateFileUrl: string | null;
}) {
  const completed = new Set(completedLessonIds);
  const [certUrl, setCertUrl] = useState(certificateFileUrl || "");
  const hasLessons = modules.some((m) => m.lessons.length > 0);

  return (
    <div className="mt-6 space-y-6">
      {/* Progress is entirely self-reported by the student now — see the
          identical dashboard view — so this is read-only. */}
      <div className="space-y-4">
        {modules.map((m) => (
          <div key={m.id}>
            <p className="text-sm font-semibold text-brand-dark dark:text-white">{m.title}</p>
            <div className="mt-2 space-y-2">
              {m.lessons.map((l) => (
                <div key={l.id} className="flex items-center gap-2 text-sm text-brand-gray dark:text-white/60">
                  {completed.has(l.id) ? (
                    <CircleCheckBig size={16} className="text-brand-blue" />
                  ) : (
                    <Circle size={16} className="text-black/20 dark:text-white/20" />
                  )}
                  <span className="flex-1">{l.title}</span>
                  {l.materialUrl && (
                    <a
                      href={l.materialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue hover:underline"
                    >
                      <FileText size={12} /> {l.materialFileName ?? "Material"}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {!hasLessons && (
          <p className="text-sm text-brand-gray dark:text-white/60">This course has no lessons yet.</p>
        )}
      </div>

      <div className="border-t border-black/5 dark:border-white/10 pt-6">
        {isComplete ? (
          <form action={updateEnrollmentProgressAction} className="space-y-4">
            <input type="hidden" name="id" value={enrollmentId} />

            <label className="flex items-center gap-2 text-sm font-medium text-brand-dark dark:text-white">
              <input
                type="checkbox"
                name="certificateIssued"
                defaultChecked={certificateIssued}
                className="h-4 w-4 rounded border-black/20 dark:border-white/25"
              />
              Certificate issued
            </label>

            {certUrl && (
              <a
                href={certUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
              >
                <FileText size={14} /> Current certificate
              </a>
            )}

            <div className="rounded-xl border border-brand-blue/30 dark:border-brand-blue/40 bg-brand-blue/5 dark:bg-brand-blue/10 p-4">
              <label className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-blue">
                <UploadCloud size={16} />
                Upload certificate (PDF)
              </label>
              <BlobFileField
                kind="certificate"
                name="certificateFileUrl"
                accept="application/pdf"
                value={certUrl}
                onChange={setCertUrl}
                className="mt-2 w-full text-sm"
              />
            </div>

            <SubmitButton>Save</SubmitButton>
          </form>
        ) : (
          <p className="text-sm text-brand-gray dark:text-white/60">
            A certificate can be awarded once the student reaches 100% progress.
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import BlobFileField from "@/app/admin/_components/BlobFileField";
import { updateEnrollmentProgressAction } from "@/lib/actions/academy";

type LessonInfo = { id: string; title: string; materialUrl: string | null; materialFileName: string | null };
type ModuleInfo = { id: string; title: string; lessons: LessonInfo[] };

export default function StudentProgressForm({
  enrollmentId,
  modules,
  allLessonIds,
  completedLessonIds,
  certificateIssued,
  certificateFileUrl,
}: {
  enrollmentId: string;
  modules: ModuleInfo[];
  allLessonIds: string[];
  completedLessonIds: string[];
  certificateIssued: boolean;
  certificateFileUrl: string | null;
}) {
  const completed = new Set(completedLessonIds);
  const [certUrl, setCertUrl] = useState(certificateFileUrl || "");

  return (
    <form action={updateEnrollmentProgressAction} className="mt-6 space-y-6">
      <input type="hidden" name="id" value={enrollmentId} />
      <input type="hidden" name="lessonIds" value={allLessonIds.join(",")} />

      <div className="space-y-4">
        {modules.map((m) => (
          <div key={m.id}>
            <p className="text-sm font-semibold text-brand-dark dark:text-white">{m.title}</p>
            <div className="mt-2 space-y-2">
              {m.lessons.map((l) => (
                <div key={l.id} className="flex items-center gap-2 text-sm text-brand-gray dark:text-white/60">
                  <label className="flex flex-1 items-center gap-2">
                    <input
                      type="checkbox"
                      name={`lesson_${l.id}`}
                      defaultChecked={completed.has(l.id)}
                      className="h-4 w-4 rounded border-black/20 dark:border-white/25"
                    />
                    {l.title}
                  </label>
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
        {allLessonIds.length === 0 && (
          <p className="text-sm text-brand-gray dark:text-white/60">This course has no lessons yet.</p>
        )}
      </div>

      <div className="border-t border-black/5 dark:border-white/10 pt-6">
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
            className="mt-2 inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
          >
            <FileText size={14} /> Current certificate
          </a>
        )}

        <div className="mt-3">
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
            Upload certificate (PDF)
          </label>
          <BlobFileField
            kind="certificate"
            name="certificateFileUrl"
            accept="application/pdf"
            value={certUrl}
            onChange={setCertUrl}
            className="w-full text-sm"
          />
        </div>
      </div>

      <SubmitButton>Save progress</SubmitButton>
    </form>
  );
}

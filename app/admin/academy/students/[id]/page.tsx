import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getAcademyEnrollmentById, getAcademyCourseById, progressPercent } from "@/lib/db/academy";
import { getUsers } from "@/lib/db/users";
import { updateEnrollmentProgressAction } from "@/lib/actions/academy";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";
import ResetLinkedPasswordButton from "@/app/admin/_components/ResetLinkedPasswordButton";

const ERROR_MESSAGES: Record<string, string> = {
  "file-type": "Certificate must be a PDF file.",
  "file-size": "Certificate must be under 5MB.",
};

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["super_admin"]);

  const { id } = await params;
  const { error } = await searchParams;
  const enrollment = await getAcademyEnrollmentById(id);
  if (!enrollment) notFound();

  const course = await getAcademyCourseById(enrollment.courseId);
  const allLessonIds = (course?.modules ?? []).flatMap((m) => m.lessons.map((l) => l.id));
  const completed = new Set(enrollment.completedLessonIds);
  const percent = progressPercent(enrollment, course);

  const users = await getUsers();
  const hasLinkedAccount = users.some((u) => u.linkedId === enrollment.id);

  return (
    <div className="max-w-2xl">
      <BackLink href="/admin/academy/students" label="Back to Students" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">{enrollment.studentName}</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        {enrollment.studentId} · {course?.en.title ?? "Unknown course"}
      </p>

      {hasLinkedAccount && (
        <div className="mt-6">
          <ResetLinkedPasswordButton linkedId={enrollment.id} />
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-brand-dark dark:text-white">Progress</span>
          <span className="text-brand-gray dark:text-white/60">{percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div className="h-full rounded-full bg-brand-blue" style={{ width: `${percent}%` }} />
        </div>

        {error && ERROR_MESSAGES[error] && (
          <p className="mt-4 text-sm text-brand-red">{ERROR_MESSAGES[error]}</p>
        )}

        <form
          action={updateEnrollmentProgressAction}
          encType="multipart/form-data"
          className="mt-6 space-y-6"
        >
          <input type="hidden" name="id" value={enrollment.id} />
          <input type="hidden" name="lessonIds" value={allLessonIds.join(",")} />

          <div className="space-y-4">
            {(course?.modules ?? []).map((m) => (
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
                defaultChecked={enrollment.certificateIssued}
                className="h-4 w-4 rounded border-black/20 dark:border-white/25"
              />
              Certificate issued
            </label>

            {enrollment.certificateFileUrl && (
              <a
                href={enrollment.certificateFileUrl}
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
              <input
                type="file"
                name="certificateFile"
                accept="application/pdf"
                className="w-full text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
          >
            Save progress
          </button>
        </form>
      </div>
    </div>
  );
}

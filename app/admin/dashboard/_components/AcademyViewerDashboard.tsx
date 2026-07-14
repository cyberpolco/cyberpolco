import { CircleCheckBig, Circle, FileDown } from "lucide-react";
import { progressPercent, type AcademyCourse, type AcademyEnrollment } from "@/lib/db/academy";

export default function AcademyViewerDashboard({
  enrollment,
  course,
}: {
  enrollment: AcademyEnrollment | undefined;
  course: AcademyCourse | undefined;
}) {
  if (!enrollment) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Dashboard</h1>
        <p className="mt-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          Your account isn&apos;t linked to an Academy enrollment yet. Contact your
          administrator.
        </p>
      </div>
    );
  }

  const percent = progressPercent(enrollment, course);
  const completed = new Set(enrollment.completedLessonIds);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">{course?.en.title ?? "Your course"}</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">Student ID: {enrollment.studentId}</p>

      <div className="mt-8 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-brand-dark dark:text-white">Progress</span>
          <span className="text-brand-gray dark:text-white/60">{percent}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
          <div className="h-full rounded-full bg-brand-blue" style={{ width: `${percent}%` }} />
        </div>

        <div className="mt-6 space-y-4">
          {(course?.modules ?? []).map((m) => (
            <div key={m.id}>
              <p className="text-sm font-semibold text-brand-dark dark:text-white">{m.title}</p>
              <div className="mt-2 space-y-1.5">
                {m.lessons.map((l) => (
                  <div key={l.id} className="flex items-center gap-2 text-sm text-brand-gray dark:text-white/60">
                    {completed.has(l.id) ? (
                      <CircleCheckBig size={16} className="text-brand-blue" />
                    ) : (
                      <Circle size={16} className="text-black/20" />
                    )}
                    {l.title}
                  </div>
                ))}
              </div>
            </div>
          ))}
          {!course && <p className="text-sm text-brand-gray dark:text-white/60">Course details unavailable.</p>}
        </div>

        {enrollment.certificateIssued && enrollment.certificateFileUrl && (
          <a
            href={enrollment.certificateFileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-4 py-2 text-sm font-semibold text-brand-blue hover:bg-brand-blue/15"
          >
            <FileDown size={16} /> Download certificate
          </a>
        )}
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { CircleCheckBig, Circle, Lock, FileDown, GraduationCap } from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import {
  getAcademyEnrollmentById,
  getEnrollmentsByStudentId,
  getAcademyCourses,
  type AcademyCourse,
  type AcademyEnrollment,
} from "@/lib/db/academy";
import { progressPercent } from "@/lib/academy/progress";
import { formatUsdCents } from "@/lib/content/money";
import { payEnrollmentFeeAction, updateOwnProgressAction, selfEnrollAction } from "@/lib/actions/academy";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import LessonMaterialViewer from "@/app/admin/academy/_components/LessonMaterialViewer";

export default async function MyCoursesPage() {
  const session = await getSession();
  if (session?.role !== "viewer" || session.viewerType !== "academy_student") redirect("/admin/dashboard");

  const linkedEnrollment = session.linkedId ? await getAcademyEnrollmentById(session.linkedId) : undefined;
  const [enrollments, courses] = await Promise.all([
    linkedEnrollment ? getEnrollmentsByStudentId(linkedEnrollment.studentId) : Promise.resolve([]),
    getAcademyCourses(),
  ]);

  const courseById = new Map(courses.map((c) => [c.id, c]));
  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));
  const availableCourses = courses.filter((c) => !enrolledCourseIds.has(c.id));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">My Courses</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Access your enrolled courses, or enroll yourself in another available course.
      </p>

      <div className="mt-6 space-y-6">
        {enrollments.map((enrollment) => (
          <EnrolledCourseCard
            key={enrollment.id}
            enrollment={enrollment}
            course={courseById.get(enrollment.courseId)}
          />
        ))}
        {enrollments.length === 0 && (
          <p className="rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-center text-sm text-brand-gray dark:text-white/60">
            You&apos;re not enrolled in any courses yet.
          </p>
        )}
      </div>

      <h2 className="mt-10 text-lg font-bold text-brand-dark dark:text-white">Available courses</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {availableCourses.map((course) => (
          <div
            key={course.id}
            className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-5"
          >
            <div className="flex items-center gap-2 text-brand-dark dark:text-white">
              <GraduationCap size={16} className="text-brand-blue" />
              <h3 className="font-semibold">{course.en.title}</h3>
            </div>
            <p className="mt-1 text-sm text-brand-gray dark:text-white/60">{course.en.description}</p>
            <p className="mt-2 text-xs text-brand-gray dark:text-white/60">
              {course.enrollmentFeeCents ? `Enrollment fee: ${formatUsdCents(course.enrollmentFeeCents)}` : "Free"}
            </p>
            <form action={selfEnrollAction} className="mt-3">
              <input type="hidden" name="courseId" value={course.id} />
              <SubmitButton variant="subtle" pendingLabel="Enrolling...">
                Enroll
              </SubmitButton>
            </form>
          </div>
        ))}
        {availableCourses.length === 0 && (
          <p className="text-sm text-brand-gray dark:text-white/60 sm:col-span-2">
            No other courses are available right now.
          </p>
        )}
      </div>
    </div>
  );
}

function EnrolledCourseCard({
  enrollment,
  course,
}: {
  enrollment: AcademyEnrollment;
  course: AcademyCourse | undefined;
}) {
  const percent = progressPercent(enrollment, course);
  const completed = new Set(enrollment.completedLessonIds);
  const feeCents = course?.enrollmentFeeCents ?? 0;
  const locked = feeCents > 0 && !enrollment.feePaid;

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-brand-dark dark:text-white">{course?.en.title ?? "Unknown course"}</h2>
        <span className="text-sm text-brand-gray dark:text-white/60">{percent}%</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
        <div className="h-full rounded-full bg-brand-blue" style={{ width: `${percent}%` }} />
      </div>

      {locked && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-yellow/30 bg-brand-yellow/10 p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-brand-dark dark:text-white">
            <Lock size={16} className="text-brand-yellow" />
            This course requires a one-time enrollment fee of {formatUsdCents(feeCents)} before you can open lesson
            materials.
          </p>
          <form action={payEnrollmentFeeAction}>
            <input type="hidden" name="enrollmentId" value={enrollment.id} />
            <SubmitButton pendingLabel="Processing...">Pay {formatUsdCents(feeCents)}</SubmitButton>
          </form>
        </div>
      )}

      <div className="mt-4 space-y-4">
        {(course?.modules ?? []).map((m) => (
          <div key={m.id}>
            <p className="text-sm font-semibold text-brand-dark dark:text-white">{m.title}</p>
            <div className="mt-2 space-y-2">
              {m.lessons.map((l) => {
                const isDone = completed.has(l.id);
                return (
                  <div key={l.id} className="rounded-lg border border-black/5 dark:border-white/10 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-brand-dark dark:text-white">
                        {isDone ? (
                          <CircleCheckBig size={16} className="text-brand-blue" />
                        ) : (
                          <Circle size={16} className="text-black/20 dark:text-white/20" />
                        )}
                        {l.title}
                      </div>
                      {!locked && (
                        <form action={updateOwnProgressAction}>
                          <input type="hidden" name="enrollmentId" value={enrollment.id} />
                          <input type="hidden" name="lessonId" value={l.id} />
                          <input type="hidden" name="completed" value={(!isDone).toString()} />
                          <SubmitButton variant="compact" pendingLabel="Saving...">
                            {isDone ? "Mark incomplete" : "Mark complete"}
                          </SubmitButton>
                        </form>
                      )}
                    </div>
                    {!locked && l.materialUrl && (
                      <div className="mt-2">
                        <LessonMaterialViewer materialUrl={l.materialUrl} materialFileName={l.materialFileName} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        {!course?.modules.length && (
          <p className="text-sm text-brand-gray dark:text-white/60">This course has no lessons yet.</p>
        )}
      </div>

      {enrollment.certificateIssued && enrollment.certificateFileUrl && (
        <div className="mt-4">
          <p className="mb-1 flex items-center gap-1.5 text-sm font-medium text-brand-dark dark:text-white">
            <FileDown size={14} /> Certificate
          </p>
          <LessonMaterialViewer materialUrl={enrollment.certificateFileUrl} materialFileName="Certificate.pdf" />
        </div>
      )}
    </div>
  );
}

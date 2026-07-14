import { createEnrollmentAction } from "@/lib/actions/academy";
import type { AcademyCourse } from "@/lib/db/academy";

export default function EnrollmentForm({ courses }: { courses: AcademyCourse[] }) {
  return (
    <form
      action={createEnrollmentAction}
      className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Student name</label>
        <input
          name="studentName"
          required
          className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
        />
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

      <button
        type="submit"
        className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
      >
        Enroll student
      </button>
    </form>
  );
}

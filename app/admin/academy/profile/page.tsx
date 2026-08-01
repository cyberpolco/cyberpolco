import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/rbac";
import { getAcademyEnrollmentById } from "@/lib/db/academy";

export default async function MyInformationPage() {
  const session = await getSession();
  if (session?.role !== "viewer" || session.viewerType !== "academy_student") redirect("/admin/dashboard");

  const enrollment = session.linkedId ? await getAcademyEnrollmentById(session.linkedId) : undefined;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">My Information</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Read-only — contact your administrator to update these details.
      </p>

      <div className="mt-6 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
        {enrollment ? (
          <dl className="space-y-3 text-sm">
            <Row label="Student ID" value={enrollment.studentId} />
            <Row label="Name" value={enrollment.studentName} />
            <Row label="Email" value={enrollment.email} />
            <Row label="Phone" value={enrollment.phone} />
          </dl>
        ) : (
          <p className="text-sm text-brand-gray dark:text-white/60">
            Your account isn&apos;t linked to an Academy enrollment yet. Contact your administrator.
          </p>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-brand-gray dark:text-white/60">{label}</dt>
      <dd className="font-medium text-brand-dark dark:text-white">{value}</dd>
    </div>
  );
}

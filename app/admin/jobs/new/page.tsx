import { requireRole } from "@/lib/auth/rbac";
import JobForm from "../_components/JobForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function NewJobPage() {
  await requireRole(["super_admin", "hr_recruiter"]);

  return (
    <div>
      <BackLink href="/admin/jobs" label="Back to jobs" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark">New job</h1>
      <div className="mt-6">
        <JobForm />
      </div>
    </div>
  );
}

import { requireRole } from "@/lib/auth/rbac";
import JobForm from "../_components/JobForm";

export default async function NewJobPage() {
  await requireRole(["super_admin", "hr_recruiter"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">New job</h1>
      <div className="mt-6">
        <JobForm />
      </div>
    </div>
  );
}

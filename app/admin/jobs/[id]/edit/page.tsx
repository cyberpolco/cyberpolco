import { notFound } from "next/navigation";
import { getJobs } from "@/lib/db/jobs";
import { requireRole } from "@/lib/auth/rbac";
import JobForm from "../../_components/JobForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["super_admin", "hr_recruiter"]);

  const { id } = await params;
  const jobs = await getJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <div>
      <BackLink href="/admin/jobs" label="Back to jobs" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Edit job</h1>
      <div className="mt-6">
        <JobForm job={job} />
      </div>
    </div>
  );
}

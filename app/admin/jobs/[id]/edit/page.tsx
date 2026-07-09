import { notFound } from "next/navigation";
import { getJobs } from "@/lib/db/jobs";
import JobForm from "../../_components/JobForm";

export default async function EditJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const jobs = await getJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Edit job</h1>
      <div className="mt-6">
        <JobForm job={job} />
      </div>
    </div>
  );
}

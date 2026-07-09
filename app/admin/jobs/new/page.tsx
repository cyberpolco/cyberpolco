import JobForm from "../_components/JobForm";

export default function NewJobPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">New job</h1>
      <div className="mt-6">
        <JobForm />
      </div>
    </div>
  );
}

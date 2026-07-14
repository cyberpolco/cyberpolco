import { notFound } from "next/navigation";
import { FileText } from "lucide-react";
import { getApplicationById } from "@/lib/db/applications";
import { requireRole } from "@/lib/auth/rbac";
import ApplicationDetailPanel from "../_components/ApplicationDetailPanel";
import BackLink from "@/app/admin/_components/BackLink";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["super_admin", "hr_recruiter"]);

  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();

  return (
    <div className="max-w-3xl">
      <BackLink href="/admin/applications" label="Back to applications" />

      <div className="mt-6 rounded-2xl border border-black/5 bg-white p-8">
        <h1 className="text-2xl font-bold text-brand-dark">{application.name}</h1>
        <p className="mt-1 text-brand-gray">Applied for {application.jobTitle}</p>

        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <a href={`mailto:${application.email}`} className="text-brand-blue">
            {application.email}
          </a>
          <a href={`tel:${application.phone}`} className="text-brand-blue">
            {application.phone}
          </a>
          {application.cvUrl.startsWith("local-storage://") ? (
            <span className="text-brand-gray">{application.cvFileName} (local dev storage)</span>
          ) : (
            <a
              href={application.cvUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-blue"
            >
              <FileText size={16} /> Download CV
            </a>
          )}
        </div>

        {application.message && (
          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-gray">
              Message
            </h2>
            <p className="mt-2 whitespace-pre-line text-brand-dark">{application.message}</p>
          </div>
        )}

        <p className="mt-6 text-xs text-brand-gray">
          Received {new Date(application.createdAt).toLocaleString()}
        </p>

        <div className="mt-8 border-t border-black/5 pt-6">
          <ApplicationDetailPanel application={application} />
        </div>
      </div>
    </div>
  );
}

import { getApplications } from "@/lib/db/applications";
import { requireRole } from "@/lib/auth/rbac";

export default async function ApplicationsPage() {
  await requireRole(["super_admin", "hr_recruiter"]);

  const applications = await getApplications();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Applications</h1>
      <p className="mt-1 text-brand-gray">Job applications submitted through the Careers pages.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 text-xs uppercase tracking-wide text-brand-gray">
            <tr>
              <th className="px-5 py-3">Candidate</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">CV</th>
              <th className="px-5 py-3">Received</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app.id} className="border-t border-black/5 align-top">
                <td className="px-5 py-3 font-medium text-brand-dark">{app.name}</td>
                <td className="px-5 py-3 text-brand-gray">{app.jobTitle}</td>
                <td className="px-5 py-3 text-brand-gray">
                  {app.email}
                  <br />
                  {app.phone}
                </td>
                <td className="px-5 py-3">
                  {app.cvUrl.startsWith("local-storage://") ? (
                    <span className="text-xs text-brand-gray">
                      {app.cvFileName} (local dev storage)
                    </span>
                  ) : (
                    <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="text-brand-blue">
                      Download
                    </a>
                  )}
                </td>
                <td className="px-5 py-3 text-brand-gray">
                  {new Date(app.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-brand-gray">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

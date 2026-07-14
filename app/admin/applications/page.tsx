import Link from "next/link";
import { getApplications } from "@/lib/db/applications";
import { requireRole } from "@/lib/auth/rbac";
import KanbanBoard from "./_components/KanbanBoard";
import ListView from "./_components/ListView";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireRole(["super_admin", "hr_recruiter"]);

  const { view } = await searchParams;
  const applications = await getApplications();
  const isListView = view === "list";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Applications</h1>
          <p className="mt-1 text-brand-gray dark:text-white/60">
            Job applications submitted through the Careers pages.
          </p>
        </div>
        <div className="flex gap-1 rounded-full border border-black/10 dark:border-white/15 p-1 text-sm">
          <Link
            href="/admin/applications"
            className={`rounded-full px-3 py-1.5 font-medium ${
              !isListView ? "bg-brand-red text-white" : "text-brand-gray dark:text-white/60"
            }`}
          >
            Board
          </Link>
          <Link
            href="/admin/applications?view=list"
            className={`rounded-full px-3 py-1.5 font-medium ${
              isListView ? "bg-brand-red text-white" : "text-brand-gray dark:text-white/60"
            }`}
          >
            List
          </Link>
        </div>
      </div>

      <div className="mt-6">
        {isListView ? (
          <ListView applications={applications} />
        ) : (
          <KanbanBoard applications={applications} />
        )}
      </div>
    </div>
  );
}

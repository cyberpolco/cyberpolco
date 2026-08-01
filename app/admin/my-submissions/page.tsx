import { requireRole } from "@/lib/auth/rbac";
import { getPendingChangesByProposer } from "@/lib/db/pending-changes";
import { getUserById } from "@/lib/db/users";
import { TARGET_LABELS, getLiveRecord, diffFields } from "@/lib/pending-changes/review";
import ExpandableDiff from "@/app/admin/pending-changes/_components/ExpandableDiff";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-status-warning/15 text-status-warning",
  approved: "bg-status-good/15 text-status-good",
  rejected: "bg-status-critical/15 text-status-critical",
};

export default async function MySubmissionsPage() {
  const session = await requireRole(["content_editor", "technician", "teacher", "hr_recruiter"]);

  const changes = await getPendingChangesByProposer(session.userId);

  const rows = await Promise.all(
    changes.map(async (change) => {
      const [live, reviewer] = await Promise.all([
        getLiveRecord(change),
        change.reviewedBy ? getUserById(change.reviewedBy) : Promise.resolve(undefined),
      ]);
      const diff = diffFields(live, change.proposedData as Record<string, unknown>);
      return { change, reviewerEmail: reviewer?.email, diff };
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">My Submissions</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Changes you&apos;ve proposed that needed super_admin approval, and their outcome.
      </p>

      <div className="mt-6 space-y-4">
        {rows.map(({ change, reviewerEmail, diff }) => (
          <div
            key={change.id}
            className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-dark dark:text-white">
                  {TARGET_LABELS[change.targetTable]}
                </p>
                <p className="text-sm text-brand-gray dark:text-white/60">
                  Submitted {new Date(change.proposedAt).toLocaleString()}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_BADGE[change.status]}`}
              >
                {change.status}
              </span>
            </div>

            {change.status !== "pending" && (
              <p className="mt-2 text-sm text-brand-gray dark:text-white/60">
                {change.status === "approved" ? "Approved" : "Rejected"} by {reviewerEmail ?? "a super admin"}
                {change.reviewedAt && ` · ${new Date(change.reviewedAt).toLocaleString()}`}
              </p>
            )}

            {change.status === "rejected" && (
              <div className="mt-3 rounded-xl border border-status-critical/30 bg-status-critical/5 p-3 text-sm text-brand-dark dark:text-white">
                {change.reviewNote ? (
                  <>
                    <span className="font-medium">Reason:</span> {change.reviewNote}
                  </>
                ) : (
                  <span className="text-brand-gray dark:text-white/60">No reason was given.</span>
                )}
              </div>
            )}

            <div className="mt-4 space-y-2 text-sm">
              {diff.changedFlat.map(({ key, before, after }) => (
                <p key={key} className="rounded-lg bg-status-warning/20 px-2 py-1">
                  <span className="font-medium text-brand-dark dark:text-white">{key}:</span>{" "}
                  <span className="text-brand-gray dark:text-white/60 line-through">{String(before ?? "—")}</span>{" "}
                  → <span className="text-brand-dark dark:text-white">{String(after ?? "—")}</span>
                </p>
              ))}
              {diff.changedComplex.map(({ key, before, after }) => (
                <ExpandableDiff key={key} label={key} before={before} after={after} />
              ))}
              {diff.changedFlat.length === 0 && diff.changedComplex.length === 0 && (
                <p className="text-brand-gray dark:text-white/60">No visible field differences.</p>
              )}
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-center text-sm text-brand-gray dark:text-white/60">
            You haven&apos;t submitted any changes that needed approval.
          </div>
        )}
      </div>
    </div>
  );
}

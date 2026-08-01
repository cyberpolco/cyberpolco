import { requireRole } from "@/lib/auth/rbac";
import { getPendingChanges } from "@/lib/db/pending-changes";
import { getUserById } from "@/lib/db/users";
import { approvePendingChangeAction, rejectPendingChangeAction } from "@/lib/actions/pending-changes";
import { TARGET_LABELS, getLiveRecord, diffFields } from "@/lib/pending-changes/review";
import ExpandableDiff from "./_components/ExpandableDiff";

export default async function PendingChangesPage() {
  await requireRole(["super_admin"]);

  const changes = await getPendingChanges("pending");

  const rows = await Promise.all(
    changes.map(async (change) => {
      const [live, proposer] = await Promise.all([getLiveRecord(change), getUserById(change.proposedBy)]);
      const diff = diffFields(live, change.proposedData as Record<string, unknown>);
      return { change, live, proposerEmail: proposer?.email ?? "Unknown", diff };
    })
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Pending changes</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Edits by Technicians/Teachers/Content Editors to records they didn&apos;t create wait here for approval.
      </p>

      <div className="mt-6 space-y-4">
        {rows.map(({ change, proposerEmail, diff }) => (
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
                  Proposed by {proposerEmail} · {new Date(change.proposedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-2 sm:items-end">
                <form action={approvePendingChangeAction}>
                  <input type="hidden" name="id" value={change.id} />
                  <button
                    type="submit"
                    className="flex w-full items-center justify-center gap-1.5 rounded-full bg-status-good/10 px-4 py-2 text-sm font-semibold text-status-good"
                  >
                    Approve
                  </button>
                </form>
                <form action={rejectPendingChangeAction} className="flex flex-col items-stretch gap-1.5 sm:items-end">
                  <input type="hidden" name="id" value={change.id} />
                  <textarea
                    name="reviewNote"
                    placeholder="Reason for rejection (optional, shown to the submitter)"
                    rows={2}
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 px-2.5 py-1.5 text-xs dark:bg-white/5 dark:text-white sm:w-56"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-full bg-status-critical/10 px-4 py-2 text-sm font-semibold text-status-critical"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              {diff.changedFlat.map(({ key, before, after }) => (
                <p key={key}>
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
            Nothing waiting on approval.
          </div>
        )}
      </div>
    </div>
  );
}

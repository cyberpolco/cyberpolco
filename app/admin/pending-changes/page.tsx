import { requireRole } from "@/lib/auth/rbac";
import { getPendingChanges, type PendingChange } from "@/lib/db/pending-changes";
import { getStarlinkClientById } from "@/lib/db/starlink";
import { getAcademyCourseById, getAcademyEnrollmentById } from "@/lib/db/academy";
import { getUserById } from "@/lib/db/users";
import { approvePendingChangeAction, rejectPendingChangeAction } from "@/lib/actions/pending-changes";

const TARGET_LABELS: Record<PendingChange["targetTable"], string> = {
  starlink_client: "Starlink client",
  academy_course: "Academy course",
  academy_enrollment: "Academy student",
};

async function getLiveRecord(change: PendingChange): Promise<Record<string, unknown> | undefined> {
  switch (change.targetTable) {
    case "starlink_client":
      return getStarlinkClientById(change.targetId) as Promise<Record<string, unknown> | undefined>;
    case "academy_course":
      return getAcademyCourseById(change.targetId) as Promise<Record<string, unknown> | undefined>;
    case "academy_enrollment":
      return getAcademyEnrollmentById(change.targetId) as Promise<Record<string, unknown> | undefined>;
  }
}

// Skip fields that never carry a meaningful before/after for a reviewer, or
// that are objects/arrays a shallow comparison can't usefully render — those
// are shown as full before/after blocks instead, per the plan.
const SKIP_KEYS = new Set(["id", "createdAt", "createdBy"]);

function diffFields(
  before: Record<string, unknown> | undefined,
  after: Record<string, unknown>
): { changedFlat: { key: string; before: unknown; after: unknown }[]; changedComplex: string[] } {
  const changedFlat: { key: string; before: unknown; after: unknown }[] = [];
  const changedComplex: string[] = [];

  for (const key of Object.keys(after)) {
    if (SKIP_KEYS.has(key)) continue;
    const beforeValue = before?.[key];
    const afterValue = after[key];
    if (typeof afterValue === "object" && afterValue !== null) {
      if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) changedComplex.push(key);
      continue;
    }
    if (beforeValue !== afterValue) changedFlat.push({ key, before: beforeValue, after: afterValue });
  }

  return { changedFlat, changedComplex };
}

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
        Edits by Technicians/Teachers to records they didn&apos;t create wait here for approval.
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
              <div className="flex gap-2">
                <form action={approvePendingChangeAction}>
                  <input type="hidden" name="id" value={change.id} />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-full bg-status-good/10 px-4 py-2 text-sm font-semibold text-status-good"
                  >
                    Approve
                  </button>
                </form>
                <form action={rejectPendingChangeAction}>
                  <input type="hidden" name="id" value={change.id} />
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
              {diff.changedComplex.map((key) => (
                <p key={key} className="text-brand-gray dark:text-white/60">
                  <span className="font-medium text-brand-dark dark:text-white">{key}</span> changed — see full
                  record after approving.
                </p>
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

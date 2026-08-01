import type { PendingChange } from "@/lib/db/pending-changes";

// Shows the outcome of the most recent submission for a content item —
// "Pending review" while awaiting a decision, or the rejection reason a
// super_admin left, right next to the item instead of only on the
// submitter's separate My Submissions page. Renders nothing once approved
// (or if there's no history at all).
export default function ChangeStatusBadge({ change }: { change: PendingChange | undefined }) {
  if (!change || change.status === "approved") return null;

  if (change.status === "pending") {
    return (
      <span className="ml-2 rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-semibold text-status-warning">
        Pending review
      </span>
    );
  }

  return (
    <>
      <span className="ml-2 rounded-full bg-status-critical/15 px-2 py-0.5 text-xs font-semibold text-status-critical">
        Rejected
      </span>
      {change.reviewNote && <p className="mt-1 text-xs font-normal text-status-critical">{change.reviewNote}</p>}
    </>
  );
}

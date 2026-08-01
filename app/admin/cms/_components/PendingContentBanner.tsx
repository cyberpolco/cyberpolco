import { getLatestChangeForTarget, type TargetTable } from "@/lib/db/pending-changes";

export default async function PendingContentBanner({
  targetTable = "content_block",
  targetId,
  pending,
}: {
  targetTable?: TargetTable;
  targetId: string;
  pending?: string;
}) {
  if (pending === "1") {
    return (
      <div className="mt-4 rounded-xl bg-brand-blue/10 p-4 text-sm text-brand-dark dark:text-white">
        Your changes have been submitted for super_admin approval.
      </div>
    );
  }

  const latestChange = await getLatestChangeForTarget(targetTable, targetId);
  if (!latestChange || latestChange.status === "approved") return null;

  if (latestChange.status === "pending") {
    return (
      <div className="mt-4 rounded-xl bg-brand-blue/10 p-4 text-sm text-brand-dark dark:text-white">
        There&apos;s a change to this page awaiting super_admin approval.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-status-critical/30 bg-status-critical/5 p-4 text-sm text-brand-dark dark:text-white">
      Your last submitted change to this page was rejected.
      {latestChange.reviewNote ? (
        <>
          {" "}
          <span className="font-medium">Reason:</span> {latestChange.reviewNote}
        </>
      ) : (
        " No reason was given."
      )}
    </div>
  );
}

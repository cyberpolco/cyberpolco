import { getPendingChangeForTarget } from "@/lib/db/pending-changes";

export default async function PendingContentBanner({
  targetId,
  pending,
}: {
  targetId: string;
  pending?: string;
}) {
  const pendingChange = pending === "1" ? undefined : await getPendingChangeForTarget("content_block", targetId);
  if (pending !== "1" && !pendingChange) return null;

  return (
    <div className="mt-4 rounded-xl bg-brand-blue/10 p-4 text-sm text-brand-dark dark:text-white">
      {pending === "1"
        ? "Your changes have been submitted for super_admin approval."
        : "There's a change to this page awaiting super_admin approval."}
    </div>
  );
}

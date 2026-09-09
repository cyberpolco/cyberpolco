import { notFound } from "next/navigation";
import { getStarlinkClientById, getHelpHistoryForClient } from "@/lib/db/starlink";
import { getReceiptsForReference } from "@/lib/db/receipts";
import { getUsers } from "@/lib/db/users";
import { requireRole } from "@/lib/auth/rbac";
import StarlinkClientForm from "@/app/admin/starlink/_components/StarlinkClientForm";
import HelpRequestHistoryList from "@/app/admin/starlink/_components/HelpRequestHistoryList";
import BackLink from "@/app/admin/_components/BackLink";
import ResetLinkedPasswordButton from "@/app/admin/_components/ResetLinkedPasswordButton";
import ReceiptsList from "@/app/admin/_components/ReceiptsList";
import ReceiptUploadForm from "@/app/admin/_components/ReceiptUploadForm";

export default async function EditStarlinkClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["super_admin", "technician"]);

  const { id } = await params;
  const client = await getStarlinkClientById(id);
  if (!client) notFound();

  const [users, helpHistory, receiptsBySiteId] = await Promise.all([
    getUsers(),
    getHelpHistoryForClient(client.id),
    Promise.all(client.sites.map((site) => getReceiptsForReference("starlink_subscription", site.id))).then(
      (lists) => new Map(client.sites.map((site, i) => [site.id, lists[i]]))
    ),
  ]);
  const hasLinkedAccount = users.some((u) => u.linkedId === client.id);
  const resolvedByName = Object.fromEntries(users.map((u) => [u.id, u.name || u.email]));

  return (
    <div>
      <BackLink href="/admin/starlink" label="Back to Starlink Management" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Edit client</h1>

      {/* Password reset stays super_admin-only, so the button that triggers
          it (which calls a super_admin-only endpoint) shouldn't appear for
          a role that would just get a 403. */}
      {hasLinkedAccount && session.role === "super_admin" && (
        <div className="mt-6">
          <ResetLinkedPasswordButton linkedId={client.id} />
        </div>
      )}

      <div className="mt-6">
        <StarlinkClientForm client={client} />
      </div>

      <div className="mt-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-dark dark:text-white">Receipts</h2>
        {client.sites.map((site) => (
          <div
            key={site.id}
            className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6"
          >
            <p className="text-sm font-semibold text-brand-dark dark:text-white">{site.siteName}</p>
            <ReceiptsList receipts={receiptsBySiteId.get(site.id) ?? []} />
            <ReceiptUploadForm referenceType="starlink_subscription" referenceId={site.id} clientId={client.id} />
          </div>
        ))}
        {client.sites.length === 0 && (
          <p className="rounded-xl border border-dashed border-black/15 dark:border-white/15 p-6 text-center text-sm text-brand-gray dark:text-white/60">
            No sites on file yet.
          </p>
        )}
      </div>

      <HelpRequestHistoryList entries={helpHistory} resolvedByName={resolvedByName} />
    </div>
  );
}

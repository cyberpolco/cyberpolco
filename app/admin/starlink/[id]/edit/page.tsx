import { notFound } from "next/navigation";
import { getStarlinkClientById, getHelpHistoryForClient } from "@/lib/db/starlink";
import { getUsers } from "@/lib/db/users";
import { requireRole } from "@/lib/auth/rbac";
import StarlinkClientForm from "@/app/admin/starlink/_components/StarlinkClientForm";
import HelpRequestHistoryList from "@/app/admin/starlink/_components/HelpRequestHistoryList";
import BackLink from "@/app/admin/_components/BackLink";
import ResetLinkedPasswordButton from "@/app/admin/_components/ResetLinkedPasswordButton";

export default async function EditStarlinkClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["super_admin", "technician"]);

  const { id } = await params;
  const client = await getStarlinkClientById(id);
  if (!client) notFound();

  const [users, helpHistory] = await Promise.all([getUsers(), getHelpHistoryForClient(client.id)]);
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

      <HelpRequestHistoryList entries={helpHistory} resolvedByName={resolvedByName} />
    </div>
  );
}

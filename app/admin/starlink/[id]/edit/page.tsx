import { notFound } from "next/navigation";
import { getStarlinkClientById } from "@/lib/db/starlink";
import { getUsers } from "@/lib/db/users";
import { requireRole } from "@/lib/auth/rbac";
import StarlinkClientForm from "@/app/admin/starlink/_components/StarlinkClientForm";
import BackLink from "@/app/admin/_components/BackLink";
import ResetLinkedPasswordButton from "@/app/admin/_components/ResetLinkedPasswordButton";

export default async function EditStarlinkClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["super_admin"]);

  const { id } = await params;
  const client = await getStarlinkClientById(id);
  if (!client) notFound();

  const users = await getUsers();
  const hasLinkedAccount = users.some((u) => u.linkedId === client.id);

  return (
    <div>
      <BackLink href="/admin/starlink" label="Back to Starlink Management" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Edit client</h1>

      {hasLinkedAccount && (
        <div className="mt-6">
          <ResetLinkedPasswordButton linkedId={client.id} />
        </div>
      )}

      <div className="mt-6">
        <StarlinkClientForm client={client} />
      </div>
    </div>
  );
}

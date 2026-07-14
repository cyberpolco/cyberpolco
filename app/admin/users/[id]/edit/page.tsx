import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { getUserById } from "@/lib/db/users";
import UserForm from "../../_components/UserForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function EditUserPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["super_admin"]);
  const { id } = await params;
  const { error } = await searchParams;
  const user = await getUserById(id);
  if (!user) notFound();

  return (
    <div>
      <BackLink href="/admin/users" label="Back to users" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark">Edit user</h1>
      <div className="mt-6 max-w-lg">
        <UserForm user={user} error={error} />
      </div>
    </div>
  );
}

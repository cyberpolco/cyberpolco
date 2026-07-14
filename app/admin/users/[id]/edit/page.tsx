import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { getUserById, getUsers } from "@/lib/db/users";
import { getStarlinkClients } from "@/lib/db/starlink";
import { getAcademyEnrollments } from "@/lib/db/academy";
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

  const [users, starlinkClients, academyEnrollments] = await Promise.all([
    getUsers(),
    getStarlinkClients(),
    getAcademyEnrollments(),
  ]);
  const linkedIds = new Set(
    users.filter((u) => u.id !== user.id).map((u) => u.linkedId).filter(Boolean)
  );

  return (
    <div>
      <BackLink href="/admin/users" label="Back to users" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Edit user</h1>
      <div className="mt-6 max-w-lg">
        <UserForm
          user={user}
          error={error}
          starlinkClients={starlinkClients.filter((c) => !linkedIds.has(c.id))}
          academyEnrollments={academyEnrollments.filter((e) => !linkedIds.has(e.id))}
        />
      </div>
    </div>
  );
}

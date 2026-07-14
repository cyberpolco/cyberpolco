import { requireRole } from "@/lib/auth/rbac";
import { getUsers } from "@/lib/db/users";
import { getStarlinkClients } from "@/lib/db/starlink";
import { getAcademyEnrollments } from "@/lib/db/academy";
import UserForm from "../_components/UserForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["super_admin"]);
  const { error } = await searchParams;

  const [users, starlinkClients, academyEnrollments] = await Promise.all([
    getUsers(),
    getStarlinkClients(),
    getAcademyEnrollments(),
  ]);
  const linkedIds = new Set(users.map((u) => u.linkedId).filter(Boolean));

  return (
    <div>
      <BackLink href="/admin/users" label="Back to users" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">New user</h1>
      <div className="mt-6 max-w-lg">
        <UserForm
          error={error}
          starlinkClients={starlinkClients.filter((c) => !linkedIds.has(c.id))}
          academyEnrollments={academyEnrollments.filter((e) => !linkedIds.has(e.id))}
        />
      </div>
    </div>
  );
}

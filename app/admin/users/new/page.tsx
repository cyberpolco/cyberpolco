import { requireRole } from "@/lib/auth/rbac";
import UserForm from "../_components/UserForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["super_admin"]);
  const { error } = await searchParams;

  return (
    <div>
      <BackLink href="/admin/users" label="Back to users" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark">New user</h1>
      <div className="mt-6 max-w-lg">
        <UserForm error={error} />
      </div>
    </div>
  );
}

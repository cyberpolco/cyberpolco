import { requireRole } from "@/lib/auth/rbac";
import UserForm from "../_components/UserForm";

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["super_admin"]);
  const { error } = await searchParams;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">New user</h1>
      <div className="mt-6 max-w-lg">
        <UserForm error={error} />
      </div>
    </div>
  );
}

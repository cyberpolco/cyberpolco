import { requireRole } from "@/lib/auth/rbac";
import StarlinkClientForm from "@/app/admin/starlink/_components/StarlinkClientForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function NewStarlinkClientPage() {
  await requireRole(["super_admin"]);

  return (
    <div>
      <BackLink href="/admin/starlink" label="Back to Starlink Management" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">New client</h1>
      <div className="mt-6">
        <StarlinkClientForm />
      </div>
    </div>
  );
}

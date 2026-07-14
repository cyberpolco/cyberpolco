import { requireRole } from "@/lib/auth/rbac";
import ServiceForm from "@/app/admin/cms/services/_components/ServiceForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function NewServicePage() {
  await requireRole(["super_admin", "content_editor"]);

  return (
    <div>
      <BackLink href="/admin/cms/services" label="Back to Services" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">New service</h1>
      <div className="mt-6">
        <ServiceForm />
      </div>
    </div>
  );
}

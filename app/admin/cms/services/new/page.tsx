import { requireRole } from "@/lib/auth/rbac";
import ServiceForm from "@/app/admin/cms/services/_components/ServiceForm";

export default async function NewServicePage() {
  await requireRole(["super_admin", "content_editor"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">New service</h1>
      <div className="mt-6">
        <ServiceForm />
      </div>
    </div>
  );
}

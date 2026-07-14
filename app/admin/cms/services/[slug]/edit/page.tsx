import { notFound } from "next/navigation";
import { getServiceBySlug } from "@/lib/db/services";
import { requireRole } from "@/lib/auth/rbac";
import ServiceForm from "@/app/admin/cms/services/_components/ServiceForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireRole(["super_admin", "content_editor"]);

  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  return (
    <div>
      <BackLink href="/admin/cms/services" label="Back to Services" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark">Edit service</h1>
      <div className="mt-6">
        <ServiceForm service={service} />
      </div>
    </div>
  );
}

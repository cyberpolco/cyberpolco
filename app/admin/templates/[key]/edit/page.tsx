import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { getTemplateRow } from "@/lib/db/templates";
import { TEMPLATE_REGISTRY, type TemplateKey } from "@/lib/email/template-registry";
import BackLink from "@/app/admin/_components/BackLink";
import TemplateForm from "../../_components/TemplateForm";

function isTemplateKey(value: string): value is TemplateKey {
  return value in TEMPLATE_REGISTRY;
}

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  await requireRole(["super_admin", "hr_recruiter"]);

  const { key } = await params;
  if (!isTemplateKey(key)) notFound();

  const def = TEMPLATE_REGISTRY[key];
  const row = await getTemplateRow(key);
  const content = { fr: row?.fr ?? def.defaultFr, en: row?.en ?? def.defaultEn };

  return (
    <div>
      <BackLink href="/admin/templates" label="Back to templates" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">{def.label}</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">{def.description}</p>
      <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
        Available variables: {def.variables.map((v) => `{{${v}}}`).join(", ")}
      </p>

      <div className="mt-6">
        <TemplateForm templateKey={key} content={content} />
      </div>
    </div>
  );
}

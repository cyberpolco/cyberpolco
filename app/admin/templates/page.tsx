import Link from "next/link";
import { Pencil } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import { getAllTemplateRows } from "@/lib/db/templates";
import { TEMPLATE_KEYS, TEMPLATE_REGISTRY } from "@/lib/email/template-registry";

export default async function AdminTemplatesPage() {
  await requireRole(["super_admin", "hr_recruiter"]);

  const rows = await getAllTemplateRows();
  const rowsByKey = new Map(rows.map((r) => [r.key, r]));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Templates</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Content of automated emails sent to clients and candidates.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
              <tr>
                <th className="px-5 py-3">Template</th>
                <th className="px-5 py-3">Subject (EN)</th>
                <th className="px-5 py-3">Last updated</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {TEMPLATE_KEYS.map((key) => {
                const def = TEMPLATE_REGISTRY[key];
                const row = rowsByKey.get(key);
                const subject = row?.en.subject ?? def.defaultEn.subject;
                return (
                  <tr key={key} className="border-t border-black/5 dark:border-white/10">
                    <td className="px-5 py-3">
                      <div className="font-medium text-brand-dark dark:text-white">{def.label}</div>
                      <div className="text-xs text-brand-gray dark:text-white/60">{def.description}</div>
                    </td>
                    <td className="px-5 py-3 text-brand-gray dark:text-white/60">{subject}</td>
                    <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                      {row ? new Date(row.updatedAt).toLocaleDateString() : "Never (default content)"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end">
                        <Link href={`/admin/templates/${key}/edit`} className="text-brand-blue">
                          <Pencil size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

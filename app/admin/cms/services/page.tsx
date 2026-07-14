import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getServices } from "@/lib/db/services";
import { deleteServiceAction } from "@/lib/actions/services";
import { requireRole } from "@/lib/auth/rbac";

export default async function AdminServicesPage() {
  await requireRole(["super_admin", "content_editor"]);

  const services = await getServices();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Services</h1>
        <Link
          href="/admin/cms/services/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New service
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 text-xs uppercase tracking-wide text-brand-gray">
            <tr>
              <th className="px-5 py-3">Name (EN)</th>
              <th className="px-5 py-3">Icon</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.slug} className="border-t border-black/5">
                <td className="px-5 py-3 font-medium text-brand-dark">{s.en.name}</td>
                <td className="px-5 py-3 text-brand-gray">{s.icon}</td>
                <td className="px-5 py-3 text-brand-gray">{s.slug}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/cms/services/${s.slug}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    <form action={deleteServiceAction}>
                      <input type="hidden" name="slug" value={s.slug} />
                      <button type="submit" className="text-brand-red">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {services.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-brand-gray">
                  No services yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

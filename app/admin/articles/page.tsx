import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { getArticles } from "@/lib/db/articles";
import { deleteArticleAction } from "@/lib/actions/articles";
import { requireRole } from "@/lib/auth/rbac";

export default async function AdminArticlesPage() {
  await requireRole(["super_admin", "content_editor"]);

  const articles = await getArticles();
  const sorted = [...articles].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New article
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Title (EN)</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3">Slug</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((a) => (
              <tr key={a.slug} className="border-t border-black/5 dark:border-white/10">
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">{a.en.title}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{a.date}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{a.slug}</td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/articles/${a.slug}/edit`} className="text-brand-blue">
                      <Pencil size={16} />
                    </Link>
                    <form action={deleteArticleAction}>
                      <input type="hidden" name="slug" value={a.slug} />
                      <button type="submit" className="text-brand-red">
                        <Trash2 size={16} />
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No articles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

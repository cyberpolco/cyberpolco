import { requireRole } from "@/lib/auth/rbac";
import ArticleForm from "../_components/ArticleForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function NewArticlePage() {
  await requireRole(["super_admin", "content_editor"]);

  return (
    <div>
      <BackLink href="/admin/articles" label="Back to articles" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark">New article</h1>
      <div className="mt-6">
        <ArticleForm />
      </div>
    </div>
  );
}

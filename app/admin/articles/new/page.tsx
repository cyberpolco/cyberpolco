import { requireRole } from "@/lib/auth/rbac";
import ArticleForm from "../_components/ArticleForm";

export default async function NewArticlePage() {
  await requireRole(["super_admin", "content_editor"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">New article</h1>
      <div className="mt-6">
        <ArticleForm />
      </div>
    </div>
  );
}

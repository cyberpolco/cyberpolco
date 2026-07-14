import { notFound } from "next/navigation";
import { getArticleBySlug } from "@/lib/db/articles";
import { requireRole } from "@/lib/auth/rbac";
import ArticleForm from "../../_components/ArticleForm";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireRole(["super_admin", "content_editor"]);

  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Edit article</h1>
      <div className="mt-6">
        <ArticleForm article={article} />
      </div>
    </div>
  );
}

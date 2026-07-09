import ArticleForm from "../_components/ArticleForm";

export default function NewArticlePage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">New article</h1>
      <div className="mt-6">
        <ArticleForm />
      </div>
    </div>
  );
}

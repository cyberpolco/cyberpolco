import { store } from "./store";
import { articles as seedArticles, type Article } from "@/lib/content/articles";

export type { Article };

const COLLECTION = "articles";

export async function getArticles(): Promise<Article[]> {
  return store.readAll<Article>(COLLECTION, seedArticles);
}

export async function getPublishedArticles(): Promise<Article[]> {
  const items = await getArticles();
  return [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getLatestArticles(count: number): Promise<Article[]> {
  const items = await getPublishedArticles();
  return items.slice(0, count);
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const items = await getArticles();
  return items.find((a) => a.slug === slug);
}

export async function saveArticle(article: Article): Promise<void> {
  const items = await getArticles();
  const idx = items.findIndex((a) => a.slug === article.slug);
  if (idx >= 0) items[idx] = article;
  else items.push(article);
  await store.writeAll(COLLECTION, items);
}

export async function deleteArticle(slug: string): Promise<void> {
  const items = await getArticles();
  await store.writeAll(
    COLLECTION,
    items.filter((a) => a.slug !== slug)
  );
}

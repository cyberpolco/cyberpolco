import { eq, sql } from "drizzle-orm";
import { db } from "./client";
import { articles as articlesTable } from "./schema";
import type { Article } from "@/lib/content/articles";

export type { Article };

export async function getArticles(): Promise<Article[]> {
  return db.select().from(articlesTable);
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
  const [item] = await db.select().from(articlesTable).where(eq(articlesTable.slug, slug));
  return item;
}

export async function saveArticle(article: Article): Promise<void> {
  await db
    .insert(articlesTable)
    .values(article)
    .onConflictDoUpdate({ target: articlesTable.slug, set: article });
}

export async function deleteArticle(slug: string): Promise<void> {
  await db.delete(articlesTable).where(eq(articlesTable.slug, slug));
}

// Atomic increments (not read-then-write) so concurrent views/shares can't
// clobber each other's counts.
export async function incrementArticleView(slug: string): Promise<void> {
  await db
    .update(articlesTable)
    .set({ viewCount: sql`${articlesTable.viewCount} + 1` })
    .where(eq(articlesTable.slug, slug));
}

export async function incrementArticleShare(slug: string): Promise<void> {
  await db
    .update(articlesTable)
    .set({ shareCount: sql`${articlesTable.shareCount} + 1` })
    .where(eq(articlesTable.slug, slug));
}

export async function getTopArticlesByViews(count: number): Promise<Article[]> {
  const items = await getArticles();
  return [...items].sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0)).slice(0, count);
}

export async function getTopArticlesByShares(count: number): Promise<Article[]> {
  const items = await getArticles();
  return [...items].sort((a, b) => (b.shareCount ?? 0) - (a.shareCount ?? 0)).slice(0, count);
}

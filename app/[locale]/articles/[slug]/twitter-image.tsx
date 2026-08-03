import { readFile } from "node:fs/promises";
import path from "node:path";
import { getArticleBySlug } from "@/lib/db/articles";
import { isArticlePublished } from "@/lib/articles/visibility";

const EXTENSION_CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const imagePath = article && isArticlePublished(article.date) ? article.image || "/images/placeholder-article.png" : "/images/placeholder-article.png";

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    const res = await fetch(imagePath);
    const buffer = await res.arrayBuffer();
    return new Response(buffer, {
      headers: { "Content-Type": res.headers.get("content-type") || "image/jpeg" },
    });
  }

  const buffer = await readFile(path.join(process.cwd(), "public", imagePath));
  const contentType = EXTENSION_CONTENT_TYPES[path.extname(imagePath).toLowerCase()] || "image/jpeg";
  return new Response(buffer, {
    headers: { "Content-Type": contentType },
  });
}

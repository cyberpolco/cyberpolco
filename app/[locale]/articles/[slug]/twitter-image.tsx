import { getArticleBySlug } from "@/lib/db/articles";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const imagePath = article?.image || "/images/placeholder-article.png";
  const res = await fetch(new URL(imagePath, "https://cyberpolco.com"));
  const buffer = await res.arrayBuffer();
  return new Response(buffer, {
    headers: { "Content-Type": res.headers.get("content-type") || "image/jpeg" },
  });
}

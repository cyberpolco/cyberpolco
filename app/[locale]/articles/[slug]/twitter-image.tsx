import { headers } from "next/headers";
import { getArticleBySlug } from "@/lib/db/articles";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const imagePath = article?.image || "/images/placeholder-article.png";

  const h = await headers();
  const host = h.get("host") || "cyberpolco.com";
  const protocol = host.startsWith("localhost") ? "http" : "https";

  const res = await fetch(new URL(imagePath, `${protocol}://${host}`));
  const buffer = await res.arrayBuffer();
  return new Response(buffer, {
    headers: { "Content-Type": res.headers.get("content-type") || "image/jpeg" },
  });
}

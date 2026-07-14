import { getArticleBySlug } from "@/lib/db/articles";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  const imagePath = article?.image || "/images/placeholder-article.png";
  return Response.redirect(new URL(imagePath, "https://cyberpolco.com"));
}

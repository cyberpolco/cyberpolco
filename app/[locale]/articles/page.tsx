import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getPublishedArticles } from "@/lib/db/articles";

export default async function ArticlesPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("articles");

  const sorted = await getPublishedArticles();

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <h1 className="text-4xl font-bold text-brand-dark">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-lg text-brand-gray">{t("subtitle")}</p>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group overflow-hidden rounded-2xl border border-black/5 transition-shadow hover:shadow-lg"
          >
            <div className="relative h-40 w-full bg-brand-dark-2/10">
              <Image
                src="/images/placeholder-article.png"
                alt=""
                fill
                className="object-contain p-10 opacity-70"
              />
            </div>
            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
                {new Date(article.date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-brand-dark group-hover:text-brand-red">
                {article[locale].title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-brand-gray">{article[locale].excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

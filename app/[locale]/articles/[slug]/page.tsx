import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { articles as seedArticles } from "@/lib/content/articles";
import { getArticleBySlug } from "@/lib/db/articles";
import ShareButton from "@/components/articles/ShareButton";
import ArticleViewTracker from "@/components/articles/ArticleViewTracker";

export function generateStaticParams() {
  return seedArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "fr" | "en"; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const content = article[locale];

  // og:image / twitter:image come from the sibling opengraph-image.tsx and
  // twitter-image.tsx files instead — file-based metadata always overrides
  // whatever this function returns for those fields, so setting them here
  // would be dead code.
  return {
    title: content.title,
    description: content.excerpt,
    openGraph: {
      title: content.title,
      description: content.excerpt,
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.excerpt,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("articles");

  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const content = article[locale];

  return (
    <article className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <ArticleViewTracker slug={slug} />
      <div className="flex items-center justify-between">
        <Link href="/articles" className="text-sm font-semibold text-brand-red">
          ← {t("back")}
        </Link>
        <ShareButton
          slug={slug}
          title={content.title}
          shareLabel={t("share")}
          copiedLabel={t("copied")}
        />
      </div>

      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-brand-blue">
        {new Date(article.date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <h1 className="mt-3 text-4xl font-bold text-brand-dark">{content.title}</h1>

      <Image
        src={article.image || "/images/placeholder-article.png"}
        alt={article.image ? content.title : ""}
        width={700}
        height={280}
        className={
          article.image
            ? "mt-8 h-56 w-full rounded-2xl border border-black/5 object-cover"
            : "mt-8 h-56 w-full rounded-2xl border border-black/5 bg-brand-dark-2/10 object-contain p-14 opacity-70"
        }
      />

      <div className="prose prose-lg mt-8 max-w-none text-brand-gray" style={{ textAlign: content.bodyAlign || "left" }}>
        {content.body.map((paragraph, i) => (
          <p key={i} className="mb-5 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="mt-10 rounded-2xl bg-brand-dark-2/5 p-6 text-sm text-brand-gray">
        {locale === "fr"
          ? "« Votre sécurité est votre priorité, heureusement, c'est aussi la nôtre. » — L'équipe Cyber PolCo"
          : "\"Your security is your first concern, fortunately we've made it ours.\" — The Cyber PolCo Team"}
      </div>
    </article>
  );
}

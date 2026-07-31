import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { legalContent } from "@/lib/content/legal";
import { localeAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const content = legalContent.terms[locale];
  return {
    title: content.title,
    alternates: localeAlternates("terms"),
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const content = legalContent.terms[locale];

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <h1 className="text-4xl font-bold text-brand-dark">{content.title}</h1>
      <p className="mt-2 text-sm text-brand-gray">{t("lastUpdated")}: July 2026</p>

      <div className="mt-8 space-y-8">
        {content.sections.map((s) => (
          <div key={s.heading}>
            <h2 className="text-lg font-semibold text-brand-dark">{s.heading}</h2>
            <p className="mt-2 text-brand-gray">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

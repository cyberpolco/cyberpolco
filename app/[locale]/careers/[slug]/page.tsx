import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { MapPin, Briefcase } from "lucide-react";
import { getJobBySlug, getEffectiveJobStatus } from "@/lib/db/jobs";
import { localeAlternates } from "@/lib/seo";
import ApplicationForm from "@/components/forms/ApplicationForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "fr" | "en"; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const job = await getJobBySlug(slug);
  const status = job ? getEffectiveJobStatus(job) : null;
  if (!job || status === "draft" || status === "scheduled") return {};

  const content = job[locale];
  return {
    title: content.title,
    description: `${content.location} · ${content.type}`,
    alternates: localeAlternates(`careers/${slug}`),
  };
}

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  const job = await getJobBySlug(slug);
  const status = job ? getEffectiveJobStatus(job) : null;
  if (!job || status === "draft" || status === "scheduled") notFound();
  const content = job[locale];
  const isClosed = status === "closed";

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <Link href="/careers" className="text-sm font-semibold text-brand-red">
        ← {t("back")}
      </Link>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-brand-dark">{content.title}</h1>
        {isClosed && (
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-brand-gray">
            {t("closedBadge")}
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-brand-gray">
        <span className="flex items-center gap-1">
          <MapPin size={15} /> {t("location")}: {content.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={15} /> {t("type")}: {content.type}
        </span>
      </div>
      {!isClosed && job.closeAt && (
        <p className="mt-2 text-sm text-brand-gray">
          {t("closesOn", { date: new Date(job.closeAt).toLocaleDateString(locale) })}
        </p>
      )}

      <div
        className="prose prose-lg mt-8 max-w-none whitespace-pre-line text-brand-gray"
        style={{ textAlign: content.descriptionAlign || "left" }}
      >
        {content.description}
      </div>

      <div className="mt-12 rounded-2xl border border-black/5 p-7">
        {isClosed ? (
          <p className="text-brand-gray">{t("closedBody")}</p>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-brand-dark">{t("applyTitle")}</h2>
            <div className="mt-5">
              <ApplicationForm jobSlug={job.slug} jobTitle={content.title} locale={locale} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

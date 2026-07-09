import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { MapPin, Briefcase } from "lucide-react";
import { getJobBySlug } from "@/lib/db/jobs";
import ApplicationForm from "@/components/forms/ApplicationForm";

export default async function CareerDetailPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");

  const job = await getJobBySlug(slug);
  if (!job || job.status !== "open") notFound();
  const content = job[locale];

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 lg:px-8">
      <Link href="/careers" className="text-sm font-semibold text-brand-red">
        ← {t("back")}
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-brand-dark">{content.title}</h1>
      <div className="mt-3 flex flex-wrap gap-4 text-sm text-brand-gray">
        <span className="flex items-center gap-1">
          <MapPin size={15} /> {t("location")}: {content.location}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={15} /> {t("type")}: {content.type}
        </span>
      </div>

      <div className="prose prose-lg mt-8 max-w-none whitespace-pre-line text-brand-gray">
        {content.description}
      </div>

      <div className="mt-12 rounded-2xl border border-black/5 p-7">
        <h2 className="text-xl font-semibold text-brand-dark">{t("applyTitle")}</h2>
        <div className="mt-5">
          <ApplicationForm jobSlug={job.slug} jobTitle={content.title} locale={locale} />
        </div>
      </div>
    </div>
  );
}

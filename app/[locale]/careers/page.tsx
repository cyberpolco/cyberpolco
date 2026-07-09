import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Briefcase, MapPin } from "lucide-react";
import { getOpenJobs } from "@/lib/db/jobs";

export default async function CareersPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("careers");
  const jobs = await getOpenJobs();

  return (
    <div className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
      <h1 className="text-4xl font-bold text-brand-dark">{t("title")}</h1>
      <p className="mt-3 text-lg text-brand-gray">{t("subtitle")}</p>

      {jobs.length === 0 ? (
        <div className="mt-14 rounded-2xl border border-dashed border-black/15 p-12 text-center">
          <Briefcase className="mx-auto text-brand-gray" size={32} />
          <h2 className="mt-4 text-xl font-semibold text-brand-dark">{t("noOpenings")}</h2>
          <p className="mt-2 text-brand-gray">{t("noOpeningsBody")}</p>
        </div>
      ) : (
        <div className="mt-12 space-y-4">
          {jobs.map((job) => (
            <Link
              key={job.id}
              href={`/careers/${job.slug}`}
              className="flex flex-col justify-between gap-2 rounded-2xl border border-black/5 p-6 transition-shadow hover:shadow-lg sm:flex-row sm:items-center"
            >
              <div>
                <h2 className="text-lg font-semibold text-brand-dark">{job[locale].title}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-brand-gray">
                  <MapPin size={14} /> {job[locale].location} · {job[locale].type}
                </p>
              </div>
              <span className="text-sm font-semibold text-brand-red">
                {locale === "fr" ? "Voir l'offre →" : "View role →"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

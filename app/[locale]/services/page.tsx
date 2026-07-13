import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, Radar, SatelliteDish, GraduationCap, SearchCheck, Layers, ArrowRight } from "lucide-react";
import { services } from "@/lib/content/services";

const ICONS = {
  shield: ShieldCheck,
  radar: Radar,
  "satellite-dish": SatelliteDish,
  "graduation-cap": GraduationCap,
  "search-check": SearchCheck,
  layers: Layers,
};

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-brand-dark">{t("title")}</h1>
        <p className="mt-4 text-lg text-brand-gray">{t("subtitle")}</p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = ICONS[service.icon];
          const content = service[locale];
          return (
            <Link
              key={service.slug}
              href={`/services/${service.slug}`}
              className="group flex flex-col rounded-2xl border border-black/5 p-7 transition-shadow hover:shadow-lg"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Icon size={24} />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-brand-dark">{content.name}</h2>
              <p className="mt-2 text-sm text-brand-gray">{content.tagline}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-brand-red">
                {t("learnMore")}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, Radar, GraduationCap, SearchCheck, Layers, ArrowRight } from "lucide-react";
import AfricaMap from "@/components/home/AfricaMap";
import { services } from "@/lib/content/services";
import { getSettings } from "@/lib/db/settings";
import { getLatestArticles } from "@/lib/db/articles";

const ICONS = {
  shield: ShieldCheck,
  radar: Radar,
  "graduation-cap": GraduationCap,
  "search-check": SearchCheck,
  layers: Layers,
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const latestArticles = await getLatestArticles(3);
  const { stats } = await getSettings();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-dark text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(98,111,218,0.25),transparent_55%)]" />
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="mb-4 inline-block rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-yellow">
              {t("eyebrow")}
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">{t("heroSubtitle")}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/services"
                className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                {t("ctaPrimary")}
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white"
              >
                {t("ctaSecondary")}
              </Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-6 rounded-full bg-brand-blue/20 blur-3xl" />
            <Image
              src="/images/placeholder-hero.png"
              alt="Cyber PolCo"
              width={420}
              height={420}
              className="relative mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-black/5 bg-brand-dark-2/5 p-8">
            <h2 className="text-2xl font-bold text-brand-dark">{t("missionTitle")}</h2>
            <p className="mt-3 text-brand-gray">{t("missionBody")}</p>
          </div>
          <div className="rounded-2xl border border-black/5 bg-brand-dark-2/5 p-8">
            <h2 className="text-2xl font-bold text-brand-dark">{t("visionTitle")}</h2>
            <p className="mt-3 text-brand-gray">{t("visionBody")}</p>
          </div>
        </div>
      </section>

      {/* Africa Map */}
      <section className="bg-brand-dark py-16 text-white">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
          <h2 className="text-3xl font-bold">{t("mapTitle")}</h2>
          <p className="mt-2 text-white/60">{t("mapSubtitle")}</p>
        </div>
        <div className="mx-auto mt-10 max-w-5xl px-5 lg:px-8">
          <AfricaMap />
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-brand-dark">{t("servicesTitle")}</h2>
          <p className="mt-2 text-brand-gray">{t("servicesSubtitle")}</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = ICONS[service.icon];
            const content = service[locale];
            return (
              <Link
                key={service.slug}
                href={`/services/${service.slug}`}
                className="group rounded-2xl border border-black/5 p-6 transition-shadow hover:shadow-lg"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-brand-dark">{content.name}</h3>
                <p className="mt-2 text-sm text-brand-gray">{content.tagline}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-red">
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-dark-2 py-16 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="text-center text-2xl font-bold">{t("statsTitle")}</h2>
          <div className="mt-10 grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.value}>
                <p className="font-display text-4xl font-bold text-brand-yellow">{s.value}</p>
                <p className="mt-2 text-sm text-white/70">{s[locale]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-brand-dark">{t("articlesTitle")}</h2>
            <p className="mt-2 text-brand-gray">{t("articlesSubtitle")}</p>
          </div>
          <Link href="/articles" className="text-sm font-semibold text-brand-red">
            {t("viewAllArticles")} →
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {latestArticles.map((article) => (
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
                <h3 className="text-lg font-semibold text-brand-dark group-hover:text-brand-red">
                  {article[locale].title}
                </h3>
                <p className="mt-2 line-clamp-3 text-sm text-brand-gray">
                  {article[locale].excerpt}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-brand-red">
        <div className="mx-auto max-w-4xl px-5 py-16 text-center text-white lg:px-8">
          <h2 className="text-3xl font-bold">{t("finalCtaTitle")}</h2>
          <p className="mt-3 text-white/85">{t("finalCtaBody")}</p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-red"
          >
            {t("finalCtaButton")}
          </Link>
        </div>
      </section>
    </>
  );
}

import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, Radar, SatelliteDish, GraduationCap, SearchCheck, Layers, ArrowRight, Target, Eye } from "lucide-react";
import AfricaMap from "@/components/home/AfricaMap";
import ClientLogos from "@/components/home/ClientLogos";
import StatsCounter from "@/components/home/StatsCounter";
import { services } from "@/lib/content/services";
import { getSettings } from "@/lib/db/settings";
import { getLatestArticles } from "@/lib/db/articles";

const ICONS = {
  shield: ShieldCheck,
  radar: Radar,
  "satellite-dish": SatelliteDish,
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

  const heroParticles = [
    { top: "12%", left: "8%", size: 3, color: "bg-brand-blue", duration: "6s", twinkle: "3.2s", delay: "0s" },
    { top: "22%", left: "42%", size: 2, color: "bg-brand-yellow", duration: "7.5s", twinkle: "4s", delay: "0.6s" },
    { top: "68%", left: "18%", size: 3, color: "bg-brand-red", duration: "5.5s", twinkle: "2.8s", delay: "1.1s" },
    { top: "80%", left: "35%", size: 2, color: "bg-brand-blue", duration: "8s", twinkle: "3.6s", delay: "0.3s" },
    { top: "15%", left: "62%", size: 2, color: "bg-brand-blue", duration: "6.8s", twinkle: "3s", delay: "1.6s" },
    { top: "48%", left: "88%", size: 3, color: "bg-brand-yellow", duration: "7s", twinkle: "4.4s", delay: "0.8s" },
    { top: "34%", left: "24%", size: 2, color: "bg-brand-red", duration: "6.2s", twinkle: "3.4s", delay: "1.9s" },
    { top: "88%", left: "70%", size: 2, color: "bg-brand-blue", duration: "7.2s", twinkle: "3.8s", delay: "0.4s" },
  ] as const;

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-dark text-white">
        {/* animated tech grid */}
        <div className="hero-grid pointer-events-none absolute inset-0" />
        {/* pulsing glow orbs */}
        <div className="hero-glow-orb pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-brand-blue/25 blur-3xl" />
        <div
          className="hero-glow-orb pointer-events-none absolute -right-16 top-0 h-96 w-96 rounded-full bg-brand-red/20 blur-3xl"
          style={{ animationDelay: "2s" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(98,111,218,0.25),transparent_55%)]" />
        {/* scanning light sweep */}
        <div className="hero-scan pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-brand-blue/10 via-transparent to-transparent" />
        {/* floating particles */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          {heroParticles.map((p, i) => (
            <span
              key={i}
              className={`hero-particle absolute rounded-full ${p.color}`}
              style={{
                top: p.top,
                left: p.left,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                ["--hero-particle-duration" as string]: p.duration,
                ["--hero-particle-twinkle" as string]: p.twinkle,
              }}
            />
          ))}
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
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
            <div className="hero-glow-orb absolute -inset-10 rounded-full bg-brand-blue/25 blur-3xl" />
            <div className="absolute inset-4 animate-spin rounded-full border border-dashed border-brand-blue/25 [animation-duration:26s]" />
            <Image
              src="/images/logo-mark.png"
              alt="Cyber PolCo"
              width={420}
              height={416}
              priority
              className="relative mx-auto object-contain drop-shadow-[0_0_45px_rgba(98,111,218,0.35)]"
            />
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-brand-dark-2/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-blue/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <Target size={24} />
            </div>
            <h2 className="relative mt-5 text-2xl font-bold text-brand-dark">{t("missionTitle")}</h2>
            <p className="relative mt-3 text-brand-gray">{t("missionBody")}</p>
          </div>
          <div className="group relative overflow-hidden rounded-2xl border border-black/5 bg-brand-dark-2/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-red/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
              <Eye size={24} />
            </div>
            <h2 className="relative mt-5 text-2xl font-bold text-brand-dark">{t("visionTitle")}</h2>
            <p className="relative mt-3 text-brand-gray">{t("visionBody")}</p>
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
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map((service) => {
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

        <div className="mt-10 flex justify-center">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 rounded-full border border-brand-red/30 px-6 py-3 text-sm font-semibold text-brand-red transition-colors hover:bg-brand-red hover:text-white"
          >
            {t("findMoreServices")}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Clients */}
      <section className="bg-brand-dark py-16 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="text-center text-3xl font-bold">{t("clientsTitle")}</h2>
          <div className="mt-10">
            <ClientLogos />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-dark-2 py-16 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="text-center text-2xl font-bold">{t("statsTitle")}</h2>
          <div className="mt-10 grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.value}>
                {s.value.includes("%") ? (
                  <StatsCounter value={s.value} durationMs={5000} />
                ) : (
                  <p className="font-display text-4xl font-bold text-brand-yellow">{s.value}</p>
                )}
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
                  src={article.image || "/images/placeholder-article.png"}
                  alt={article.image ? article[locale].title : ""}
                  fill
                  className={article.image ? "object-cover" : "object-contain p-10 opacity-70"}
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

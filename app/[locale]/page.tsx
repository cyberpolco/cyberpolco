import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Target, Eye, Fingerprint, Lock } from "lucide-react";
import AfricaMap from "@/components/home/AfricaMap";
import ClientLogos from "@/components/home/ClientLogos";
import StatsCounter from "@/components/home/StatsCounter";
import DecryptWordCycler from "@/components/home/DecryptWordCycler";
import { getServices } from "@/lib/db/services";
import { SERVICE_ICONS } from "@/lib/content/service-icons";
import { getSettings } from "@/lib/db/settings";
import { getLatestArticles } from "@/lib/db/articles";
import { getBlock } from "@/lib/content/blocks";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const latestArticles = await getLatestArticles(3);
  const services = await getServices();
  const { stats } = await getSettings();
  const [hero, mission, vision, map, servicesIntro, clientsIntro, statsIntro, articlesIntro, finalCta] =
    await Promise.all([
      getBlock("home.hero", locale),
      getBlock("home.mission", locale),
      getBlock("home.vision", locale),
      getBlock("home.map", locale),
      getBlock("home.servicesIntro", locale),
      getBlock("home.clientsIntro", locale),
      getBlock("home.statsIntro", locale),
      getBlock("home.articlesIntro", locale),
      getBlock("home.finalCta", locale),
    ]);

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

  // Every position below was laid out and screenshot-verified (icons,
  // binary digits, keywords, and decrypting words) so none of these
  // background layers overlap each other, and all stay zoned to the right
  // column / margins so the heading, subtitle, and CTAs are never covered.
  const heroCyberIcons = [
    { Icon: Fingerprint, kind: "fingerprint", top: "9%", left: "64%", size: 40, color: "text-brand-blue", duration: "7.5s", delay: "0s" },
    { Icon: Lock, kind: "lock", top: "16%", left: "96%", size: 30, color: "text-brand-red", duration: "6.2s", delay: "1.2s" },
    { Icon: Fingerprint, kind: "fingerprint", top: "27%", left: "58%", size: 36, color: "text-brand-yellow", duration: "8.4s", delay: "2.4s" },
    { Icon: Lock, kind: "lock", top: "35%", left: "94%", size: 26, color: "text-brand-blue", duration: "6.8s", delay: "0.6s" },
    { Icon: Fingerprint, kind: "fingerprint", top: "60%", left: "66%", size: 44, color: "text-brand-red", duration: "9s", delay: "1.8s" },
    { Icon: Lock, kind: "lock", top: "68%", left: "90%", size: 28, color: "text-brand-yellow", duration: "7s", delay: "3s" },
    { Icon: Fingerprint, kind: "fingerprint", top: "71%", left: "58%", size: 34, color: "text-brand-blue", duration: "7.8s", delay: "2s" },
    { Icon: Lock, kind: "lock", top: "84%", left: "94%", size: 32, color: "text-brand-red", duration: "6.5s", delay: "0.9s" },
    { Icon: Fingerprint, kind: "fingerprint", top: "96%", left: "92%", size: 30, color: "text-brand-blue", duration: "7.2s", delay: "1.5s" },
    { Icon: Lock, kind: "lock", top: "2%", left: "80%", size: 22, color: "text-brand-yellow", duration: "8s", delay: "0.3s" },
  ] as const;

  // Keywords now carry the decrypt animation themselves (see render below).
  // FIREWALL used to sit at left:62%, right where the logo mark's horizontal
  // span lands at typical desktop widths — the opaque mark was covering it.
  // Moved above the logo's vertical band instead. DDoS/IAM are new: the left
  // column had no decoration at all, so they're zoned to the empty margins
  // above the eyebrow badge and below the CTA buttons, clear of the heading.
  const heroKeywords = [
    { term: "ENCRYPTION", top: "3%", left: "68%" },
    { term: "FIREWALL", top: "4%", left: "56%" },
    { term: "ZERO-DAY", top: "33%", left: "78%" },
    { term: "MALWARE", top: "10%", left: "88%" },
    { term: "THREAT INTEL", top: "8%", left: "80%" },
    { term: "RANSOMWARE", top: "60%", left: "78%" },
    { term: "SIEM", top: "51%", left: "90%" },
    { term: "SOC 24/7", top: "70%", left: "62%" },
    { term: "OSINT", top: "91%", left: "84%" },
    { term: "CVE-2024", top: "24%", left: "62%" },
    { term: "PENTEST", top: "89%", left: "56%" },
    { term: "PHISHING", top: "82%", left: "70%" },
    { term: "DDOS", top: "6%", left: "8%" },
    { term: "IAM", top: "90%", left: "10%" },
  ] as const;

  const heroBinary = [
    { char: "1", top: "9%", left: "70%", duration: "6.2s", twinkle: "3.4s", delay: "0.2s" },
    { char: "0", top: "16%", left: "86%", duration: "7s", twinkle: "3.8s", delay: "1s" },
    { char: "1", top: "23%", left: "70%", duration: "6.6s", twinkle: "3.1s", delay: "1.6s" },
    { char: "0", top: "31%", left: "86%", duration: "7.4s", twinkle: "4s", delay: "0.5s" },
    { char: "1", top: "40%", left: "70%", duration: "6.8s", twinkle: "3.6s", delay: "2.1s" },
    { char: "0", top: "44%", left: "86%", duration: "7.2s", twinkle: "3.2s", delay: "1.3s" },
    { char: "1", top: "53%", left: "70%", duration: "6.4s", twinkle: "3.9s", delay: "0.8s" },
    { char: "0", top: "63%", left: "86%", duration: "7.6s", twinkle: "3.5s", delay: "2.4s" },
    { char: "1", top: "67%", left: "70%", duration: "6.9s", twinkle: "3.3s", delay: "1.9s" },
    { char: "0", top: "83%", left: "86%", duration: "7.1s", twinkle: "3.7s", delay: "0.6s" },
    { char: "1", top: "95%", left: "56%", duration: "6.5s", twinkle: "3.6s", delay: "1.1s" },
    { char: "0", top: "95%", left: "88%", duration: "7.3s", twinkle: "3.4s", delay: "0.4s" },
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
        {/* glowing fingerprints + pulsing locks */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          {heroCyberIcons.map(({ Icon, kind, top, left, size, color, duration, delay }, i) => (
            <Icon
              key={i}
              size={size}
              className={`absolute ${kind === "lock" ? "hero-lock" : "hero-fingerprint"} ${color}`}
              style={{
                top,
                left,
                animationDelay: delay,
                ["--hero-fx-duration" as string]: duration,
              }}
            />
          ))}
        </div>
        {/* floating binary digits */}
        <div className="pointer-events-none absolute inset-0 hidden sm:block">
          {heroBinary.map((b, i) => (
            <span
              key={i}
              className="login-binary absolute select-none font-mono text-sm font-bold text-brand-blue/25"
              style={{
                top: b.top,
                left: b.left,
                animationDelay: b.delay,
                ["--hero-particle-duration" as string]: b.duration,
                ["--hero-particle-twinkle" as string]: b.twinkle,
              }}
            >
              {b.char}
            </span>
          ))}
        </div>
        {/* cybersecurity keywords, decrypting in place */}
        <div className="pointer-events-none absolute inset-0 hidden lg:block">
          {heroKeywords.map(({ term, top, left }, i) => (
            <div key={i} className="absolute" style={{ top, left }}>
              <DecryptWordCycler
                words={[term]}
                className="whitespace-nowrap text-sm font-bold uppercase text-white/90"
              />
            </div>
          ))}
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-20 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="mb-4 inline-block rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-yellow">
              {hero.eyebrow}
            </p>
            <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              {hero.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/70">{hero.heroSubtitle}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/services"
                className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.03]"
              >
                {hero.ctaPrimary}
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:border-white"
              >
                {hero.ctaSecondary}
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

      {/* Services */}
      <section className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-brand-dark">{servicesIntro.title}</h2>
          <p className="mt-2 text-brand-gray">{servicesIntro.subtitle}</p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map((service) => {
            const Icon = SERVICE_ICONS[service.icon];
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
          <h2 className="text-center text-3xl font-bold">{clientsIntro.title}</h2>
          <div className="mt-10">
            <ClientLogos />
          </div>
        </div>
      </section>

      {/* Vision / Mission */}
      <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div className="group relative flex aspect-square flex-col overflow-hidden rounded-2xl border border-black/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-red/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-red/10 text-brand-red">
              <Eye size={24} />
            </div>
            <h2 className="relative mt-5 text-3xl font-bold text-brand-dark">{vision.title}</h2>
            <p className="relative mt-3 line-clamp-4 text-base text-brand-gray">{vision.body}</p>
          </div>
          <div className="relative aspect-square overflow-hidden rounded-2xl border border-black/5">
            <Image
              src="/images/cofounder-photo.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <div className="group relative flex aspect-square flex-col overflow-hidden rounded-2xl border border-black/5 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-brand-blue/10 blur-2xl transition-transform duration-500 group-hover:scale-125" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
              <Target size={24} />
            </div>
            <h2 className="relative mt-5 text-3xl font-bold text-brand-dark">{mission.title}</h2>
            <p className="relative mt-3 line-clamp-4 text-base text-brand-gray">{mission.body}</p>
          </div>
        </div>
      </section>

      {/* Africa Map */}
      <section className="bg-brand-dark py-16 text-white">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
          <h2 className="text-3xl font-bold">{map.title}</h2>
          <p className="mt-2 text-white/60">{map.subtitle}</p>
        </div>
        <div className="mx-auto mt-10 max-w-5xl px-5 lg:px-8">
          <AfricaMap />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-dark-2 py-16 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <h2 className="text-center text-2xl font-bold">{statsIntro.title}</h2>
          <div className="mt-10 grid grid-cols-2 gap-8 text-center sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.value}>
                {s.value.includes("%") ? (
                  <StatsCounter value={s.value} durationMs={3000} />
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
            <h2 className="text-3xl font-bold text-brand-dark">{articlesIntro.title}</h2>
            <p className="mt-2 text-brand-gray">{articlesIntro.subtitle}</p>
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
          <h2 className="text-3xl font-bold">{finalCta.title}</h2>
          <p className="mt-3 text-white/85">{finalCta.body}</p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-red"
          >
            {finalCta.button}
          </Link>
        </div>
      </section>
    </>
  );
}

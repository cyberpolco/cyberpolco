import { getTranslations, getLocale } from "next-intl/server";
import Image from "next/image";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { MessageCircle } from "lucide-react";
import { offices } from "@/lib/content/company";
import { services } from "@/lib/content/services";
import { getSettings } from "@/lib/db/settings";

// lucide-react dropped brand/logo icons — inline glyphs for the platforms we link to.
function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.99l-5.47-6.82L4.14 22H1l8.03-9.17L1.5 2h7.16l4.95 6.23L18.24 2Zm-1.23 18h1.72L7.08 4h-1.8l11.73 16Z" />
    </svg>
  );
}
function TikTokGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M14 3c.5 2.6 2.1 4.2 5 4.4v3c-1.8.1-3.4-.4-5-1.5v6.4a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v3.1a2.5 2.5 0 1 0 1.7 2.4V3H14Z" />
    </svg>
  );
}
function GithubGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.36-3.37-1.36-.46-1.2-1.11-1.52-1.11-1.52-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}
function LinkedinGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.64h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96V21h-4V9Z" />
    </svg>
  );
}
function YoutubeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.49 20.5 12 20.5 12 20.5s7.51 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.6 15.5v-7l6.27 3.5-6.27 3.5Z" />
    </svg>
  );
}

export default async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const locale = (await getLocale()) as "fr" | "en";
  const { socialLinks } = await getSettings();

  const socialIcons = [
    { href: socialLinks.x, icon: <XGlyph />, label: "X" },
    { href: socialLinks.linkedin, icon: <LinkedinGlyph />, label: "LinkedIn" },
    { href: socialLinks.tiktok, icon: <TikTokGlyph />, label: "TikTok" },
    { href: socialLinks.youtube, icon: <YoutubeGlyph />, label: "YouTube" },
    { href: socialLinks.github, icon: <GithubGlyph />, label: "GitHub" },
    { href: socialLinks.whatsappChannel, icon: <MessageCircle size={18} />, label: "WhatsApp" },
  ];

  return (
    <footer className="border-t border-white/10 bg-brand-dark text-white/80">
      <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Image src="/images/logo.png" alt="Cyber PolCo" width={36} height={36} className="rounded-full" />
              <span className="font-display text-lg font-bold text-white">Cyber PolCo</span>
            </div>
            <p className="text-sm text-white/60">{t("tagline")}</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
              {t("servicesTitle")}
            </h4>
            <ul className="space-y-2 text-sm">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/services/${s.slug}`} className="hover:text-white">
                    {s[locale].name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
              {t("companyTitle")}
            </h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-white">{tNav("about")}</Link></li>
              <li><Link href="/articles" className="hover:text-white">{tNav("articles")}</Link></li>
              <li><Link href="/careers" className="hover:text-white">{tNav("careers")}</Link></li>
              <li><Link href="/contact" className="hover:text-white">{tNav("contact")}</Link></li>
            </ul>
            <div className="mt-4 space-y-1 text-sm text-white/60">
              {offices.map((o) => (
                <div key={o.country}>
                  <span className="font-medium text-white/80">{o[locale].city}</span> · {o.phone}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white">
              {t("followTitle")}
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialIcons.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 transition-colors hover:border-brand-yellow hover:text-brand-yellow"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50 md:flex-row md:items-center">
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">{t("privacy")}</Link>
            <Link href="/terms" className="hover:text-white">{t("terms")}</Link>
            <NextLink href="/admin/dashboard" className="hover:text-white">Dashboard</NextLink>
          </div>
          <p>{t("rights")}</p>
        </div>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import RouteChangeProgressBar from "@/components/layout/RouteChangeProgressBar";
import { ToastProvider } from "@/components/ui/toast";
import { socialLinks, contactEmails } from "@/lib/content/company";
import "../globals.css";

const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Cyber PolCo",
  url: "https://cyberpolco.com",
  logo: "https://cyberpolco.com/images/logo.png",
  email: contactEmails.info,
  sameAs: [socialLinks.linkedin, socialLinks.x, socialLinks.tiktok, socialLinks.youtube, socialLinks.github],
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL("https://cyberpolco.com"),
  title: {
    default: "Cyber PolCo — Limit the Risk Now",
    template: "%s | Cyber PolCo",
  },
  description:
    "Cyber PolCo delivers cybersecurity consulting, SOC/MSSP, awareness trainings, and background checks across the Democratic Republic of Congo, Namibia, and Southern Africa.",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as "fr" | "en")) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-white font-sans text-brand-dark antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <RouteChangeProgressBar />
            <Header />
            <main>{children}</main>
            <Footer />
          </ToastProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}

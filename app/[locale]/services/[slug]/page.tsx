import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { services as seedServices } from "@/lib/content/services";
import { getServiceBySlug } from "@/lib/db/services";
import { localeAlternates } from "@/lib/seo";
import ServiceDetail from "../_components/ServiceDetail";

export function generateStaticParams() {
  return seedServices.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "fr" | "en"; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  const content = service[locale];
  return {
    title: content.name,
    description: content.tagline,
    alternates: localeAlternates(`services/${slug}`),
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: "fr" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  return <ServiceDetail slug={slug} locale={locale} />;
}

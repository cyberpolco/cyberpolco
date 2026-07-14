import { setRequestLocale } from "next-intl/server";
import { services as seedServices } from "@/lib/content/services";
import ServiceDetail from "../_components/ServiceDetail";

export function generateStaticParams() {
  return seedServices.map((s) => ({ slug: s.slug }));
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

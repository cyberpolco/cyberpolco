import { setRequestLocale } from "next-intl/server";
import ServiceDetail from "../_components/ServiceDetail";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ServiceDetail slug="consulting" locale={locale} />;
}

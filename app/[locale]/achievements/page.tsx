import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function AchievementsPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("achievements");

  return (
    <div className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
      <h1 className="text-4xl font-bold text-brand-dark">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-brand-gray">{t("subtitle")}</p>
    </div>
  );
}

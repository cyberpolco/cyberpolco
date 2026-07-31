import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getSortedAchievements } from "@/lib/db/achievements";
import { localeAlternates } from "@/lib/seo";
import AchievementPhoto from "./_components/AchievementPhoto";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "achievements" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: localeAlternates("achievements"),
  };
}

export default async function AchievementsPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("achievements");
  const items = [...(await getSortedAchievements())].reverse();

  return (
    <div className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
      <h1 className="text-4xl font-bold text-brand-dark">{t("title")}</h1>
      <p className="mt-3 max-w-2xl text-brand-gray">{t("subtitle")}</p>

      {items.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-black/10 py-16 text-center text-brand-gray">
          <p>{t("empty")}</p>
        </div>
      ) : (
        <ol className="relative mt-16 space-y-12">
          {items.map((item) => {
            const localized = item[locale];
            const photos = [item.image1, item.image2].filter(
              (src): src is string => Boolean(src)
            );
            return (
              <li
                key={item.id}
                className="relative grid grid-cols-[auto_1fr] gap-x-6 sm:grid-cols-[7rem_1px_1fr_auto] sm:gap-x-8"
              >
                <div className="text-sm font-semibold uppercase tracking-wide text-brand-blue sm:pt-1 sm:text-right">
                  {new Date(item.date).toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
                    year: "numeric",
                    month: "long",
                    timeZone: "UTC",
                  })}
                </div>

                <div className="relative hidden sm:block">
                  <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-black/10" />
                  <div className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-brand-red bg-white" />
                </div>

                <div className="text-brand-gray">
                  <p className="text-base leading-relaxed text-justify">{localized.description}</p>
                </div>

                {photos.length > 0 && (
                  <div className="col-span-2 mt-4 flex gap-3 sm:col-span-1 sm:col-start-4 sm:row-start-1 sm:mt-0 sm:w-72 sm:shrink-0">
                    {photos.map((src, i) => (
                      <AchievementPhoto
                        key={i}
                        src={src}
                        sizes="(min-width: 640px) 138px, 45vw"
                      />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

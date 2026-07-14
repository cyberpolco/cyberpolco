import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getBlock } from "@/lib/content/blocks";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const [story, leadership, sector] = await Promise.all([
    getBlock("about.story", locale),
    getBlock("about.leadership", locale),
    getBlock("about.sector", locale),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
      <h1 className="text-4xl font-bold text-brand-dark">{t("title")}</h1>

      <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-start">
        <Image
          src="/images/placeholder-team.png"
          alt=""
          width={140}
          height={140}
          className="rounded-2xl border border-black/5"
        />
        <div>
          <h2 className="text-2xl font-semibold text-brand-dark">{t("storyTitle")}</h2>
          <p className="mt-3 text-brand-gray">{story.p1}</p>
          <p className="mt-3 text-brand-gray">{story.p2}</p>
          <p className="mt-3 text-brand-gray">{story.p3}</p>
          <p className="mt-5 font-display text-lg font-semibold italic text-brand-blue">
            {story.quote}
          </p>
        </div>
      </div>

      <div className="mt-14 rounded-2xl bg-brand-dark-2/5 p-8">
        <h2 className="text-2xl font-semibold text-brand-dark">{t("leadershipTitle")}</h2>
        <p className="mt-2 font-semibold text-brand-dark">{leadership.name}</p>
        <p className="text-sm text-brand-gray">{leadership.roleTitle}</p>
        <p className="mt-3 text-brand-gray">{leadership.body}</p>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-brand-dark">{t("sectorTitle")}</h2>
        <p className="mt-3 text-brand-gray">{sector.body}</p>
      </div>
    </div>
  );
}

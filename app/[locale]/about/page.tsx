import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";
import { getBlock } from "@/lib/content/blocks";
import { getTeamMembers } from "@/lib/db/team";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const [story, leadership, teamMembers] = await Promise.all([
    getBlock("about.story", locale),
    getBlock("about.leadership", locale),
    getTeamMembers(),
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
        <div className="mt-4 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="relative aspect-square w-40 shrink-0 overflow-hidden rounded-2xl border border-black/5 sm:w-48">
            <Image src="/images/cofounder-photo.png" alt="" fill sizes="192px" className="object-cover" />
          </div>
          <div>
            <p className="font-semibold text-brand-dark">{leadership.name}</p>
            <p className="text-sm text-brand-gray">{leadership.roleTitle}</p>
            <p className="mt-3 text-brand-gray">{leadership.body}</p>
          </div>
        </div>
      </div>

      <div className="mt-14">
        <h2 className="text-2xl font-semibold text-brand-dark">{t("teamTitle")}</h2>
        <p className="mt-2 text-brand-gray">{t("teamSubtitle")}</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((m) => {
            const localized = m[locale];
            return (
              <div key={m.id} className="rounded-2xl border border-black/5 p-6">
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-black/5">
                  <Image
                    src={m.photo || "/images/logo-mark.png"}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <p className="mt-4 font-semibold text-brand-dark">{m.name}</p>
                <p className="text-sm text-brand-gray">{localized.title}</p>
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium text-brand-blue">
                    {t("teamBioToggle")}
                  </summary>
                  <p className="mt-2 text-sm text-brand-gray">{localized.bio}</p>
                </details>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

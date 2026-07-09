import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const copy = {
    fr: {
      storyP1:
        "Fondée à Mbujimayi, en République Démocratique du Congo, en mai 2025, Cyber PolCo est enregistrée sous le nom de Cyber PolCo Ets. L'entreprise a été cofondée par Léon Atunakou, un jeune Congolais poursuivant ses études en cybersécurité.",
      storyP2:
        "Nous proposons des solutions de cybersécurité d'un standard élevé tout en sensibilisant et formant les individus, des plus jeunes aux professionnels en entreprise, à travers nos programmes complets de formation et de sensibilisation.",
      storyP3:
        "Consciente de la rareté des professionnels qualifiés dans ce domaine, Cyber PolCo s'engage à répondre à la demande croissante de services spécialisés dans un monde toujours plus numérique et interconnecté. L'utilisation de l'intelligence artificielle et du machine learning renforce notre capacité à détecter et à réagir rapidement et efficacement aux menaces.",
      quote: "« Votre sécurité est votre priorité, heureusement, c'est aussi la nôtre. »",
      leadershipBody:
        "Léon Atunakou a cofondé Cyber PolCo lors de sa dernière année d'université, alors qu'il poursuivait une licence en informatique spécialisée en cybersécurité, dans l'optique de rentrer dans son pays afin de participer à la révolution numérique que connaît actuellement le Congo. Son parcours académique et son expérience pratique, notamment son stage au sein de United Africa Group, lui confèrent les compétences nécessaires pour porter la vision technologique et la stratégie de Cyber PolCo.",
      sectorBody:
        "En RD Congo, le marché de la cybersécurité est encore naissant et peu structuré, avec une concentration des services dans la capitale. Cyber PolCo se positionne comme une réponse innovante à ce vide — à Mbujimayi, aucune entreprise n'est encore dédiée exclusivement à ce domaine, ce qui ouvre la voie à une implantation stratégique et pionnière.",
    },
    en: {
      storyP1:
        "Founded in Mbujimayi, Democratic Republic of Congo, in May 2025, Cyber PolCo is registered as Cyber PolCo Ets. The company was co-founded by Léon Atunakou, a young Congolese cybersecurity student.",
      storyP2:
        "We deliver high-standard cybersecurity solutions while raising awareness and training individuals — from young people to enterprise professionals — through our comprehensive training and awareness programs.",
      storyP3:
        "Aware of the shortage of qualified professionals in this field, Cyber PolCo is committed to meeting the growing demand for specialized services in an increasingly digital and interconnected world. Our use of artificial intelligence and machine learning strengthens our ability to detect and respond to threats quickly and effectively.",
      quote: "\"Your security is your first concern, fortunately we've made it ours.\"",
      leadershipBody:
        "Léon Atunakou co-founded Cyber PolCo during his final year of university, while completing a computer science degree specialized in cybersecurity, with the goal of returning to his country to take part in the digital revolution currently underway in Congo. His academic background and hands-on experience — including an internship at United Africa Group — give him the skills needed to lead Cyber PolCo's technological vision and strategy.",
      sectorBody:
        "In the DRC, the cybersecurity market is still nascent and loosely structured, with services concentrated in the capital. Cyber PolCo positions itself as an innovative response to this gap — in Mbujimayi, no company is yet exclusively dedicated to this field, opening the way for a strategic, pioneering presence.",
    },
  }[locale];

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
          <p className="mt-3 text-brand-gray">{copy.storyP1}</p>
          <p className="mt-3 text-brand-gray">{copy.storyP2}</p>
          <p className="mt-3 text-brand-gray">{copy.storyP3}</p>
          <p className="mt-5 font-display text-lg font-semibold italic text-brand-blue">
            {copy.quote}
          </p>
        </div>
      </div>

      <div className="mt-14 rounded-2xl bg-brand-dark-2/5 p-8">
        <h2 className="text-2xl font-semibold text-brand-dark">{t("leadershipTitle")}</h2>
        <p className="mt-2 font-semibold text-brand-dark">Léon Atunakou</p>
        <p className="text-sm text-brand-gray">
          {locale === "fr" ? "Cofondateur & Directeur Technique" : "Co-founder & Chief Technical Officer"}
        </p>
        <p className="mt-3 text-brand-gray">{copy.leadershipBody}</p>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold text-brand-dark">{t("sectorTitle")}</h2>
        <p className="mt-3 text-brand-gray">{copy.sectorBody}</p>
      </div>
    </div>
  );
}

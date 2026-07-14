import { getContentBlock, type Localized } from "@/lib/db/content";

type Hero = {
  eyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  ctaPrimary: string;
  ctaSecondary: string;
};
type TitleBody = { title: string; body: string };
type TitleSubtitle = { title: string; subtitle: string };
type TitleOnly = { title: string };
type FinalCta = { title: string; body: string; button: string };
type Story = { p1: string; p2: string; p3: string; quote: string };
type Leadership = { name: string; roleTitle: string; body: string };
type BodyOnly = { body: string };
type SubtitleOnly = { subtitle: string };
type TaglineOnly = { tagline: string };

// Literal current copy — also used as the seed source (lib/db/seed.ts) so
// the CMS rollout changes nothing visually until someone edits a block.
export const blockDefaults = {
  "home.hero": {
    fr: {
      eyebrow: "Cybersécurité · RD Congo · Namibie",
      heroTitle: "Limitez le risque, maintenant.",
      heroSubtitle:
        "Cyber PolCo protège les infrastructures numériques des entreprises, institutions et particuliers en République Démocratique du Congo, en Namibie et au-delà.",
      ctaPrimary: "Découvrir nos services",
      ctaSecondary: "Parler à un expert",
    },
    en: {
      eyebrow: "Cybersecurity · DR Congo · Namibia",
      heroTitle: "Limit the risk, now.",
      heroSubtitle:
        "Cyber PolCo protects the digital infrastructure of businesses, institutions, and individuals across the Democratic Republic of Congo, Namibia, and beyond.",
      ctaPrimary: "Explore our services",
      ctaSecondary: "Talk to an expert",
    },
  } satisfies Localized<Hero>,

  "home.mission": {
    fr: {
      title: "Notre mission",
      body: "Être un leader en cybersécurité, en offrant à nos clients une protection inégalée et une tranquillité d'esprit totale, afin qu'ils puissent se concentrer sur leurs activités principales, en toute confiance.",
    },
    en: {
      title: "Our mission",
      body: "To be a leader in cybersecurity, offering our clients unmatched protection and total peace of mind, so they can focus on their core business with full confidence.",
    },
  } satisfies Localized<TitleBody>,

  "home.vision": {
    fr: {
      title: "Notre vision",
      body: "Être le leader régional de référence en cybersécurité et en intelligence artificielle, en étant pionnier de solutions propulsées par l'IA qui protègent les écosystèmes numériques et permettent aux organisations et communautés à travers l'Afrique de prospérer grâce à une transformation numérique sécurisée, innovante et porteuse d'impact.",
    },
    en: {
      title: "Our vision",
      body: "To be the trusted regional leader in cybersecurity and artificial intelligence, pioneering AI-powered solutions that protect digital ecosystems and enable organizations and communities across Africa to thrive through secure, innovative, and impactful digital transformation.",
    },
  } satisfies Localized<TitleBody>,

  "home.map": {
    fr: { title: "Notre présence en Afrique", subtitle: "Survolez ou touchez un pays pour en savoir plus." },
    en: { title: "Our presence across Africa", subtitle: "Hover or tap a country to learn more." },
  } satisfies Localized<TitleSubtitle>,

  "home.servicesIntro": {
    fr: {
      title: "Nos services",
      subtitle:
        "Des solutions professionnelles de cybersécurité et de consulting pour entreprises, institutions et particuliers.",
    },
    en: {
      title: "Our services",
      subtitle:
        "Professional cybersecurity solutions and specialized consulting for businesses, institutions, and individuals.",
    },
  } satisfies Localized<TitleSubtitle>,

  "home.clientsIntro": {
    fr: { title: "Nos clients fidèles et satisfaits" },
    en: { title: "Our valued and satisfied clients" },
  } satisfies Localized<TitleOnly>,

  "home.statsIntro": {
    fr: { title: "Cyber PolCo en chiffres" },
    en: { title: "Cyber PolCo at a glance" },
  } satisfies Localized<TitleOnly>,

  "home.articlesIntro": {
    fr: {
      title: "Derniers articles",
      subtitle: "Nos analyses et conseils pour naviguer en ligne en toute sécurité.",
    },
    en: {
      title: "Latest articles",
      subtitle: "Our insights and advice for navigating the internet safely.",
    },
  } satisfies Localized<TitleSubtitle>,

  "home.finalCta": {
    fr: {
      title: "Prêt à sécuriser votre organisation ?",
      body: "Parlons de vos besoins en cybersécurité, sensibilisation ou conformité.",
      button: "Contactez notre équipe",
    },
    en: {
      title: "Ready to secure your organization?",
      body: "Let's talk about your cybersecurity, awareness, or compliance needs.",
      button: "Contact our team",
    },
  } satisfies Localized<FinalCta>,

  "about.story": {
    fr: {
      p1: "Fondée à Mbujimayi, en République Démocratique du Congo, en mai 2025, Cyber PolCo est enregistrée sous le nom de Cyber PolCo Ets. L'entreprise a été cofondée par Léon Atunakou, un jeune Congolais poursuivant ses études en cybersécurité.",
      p2: "Nous proposons des solutions de cybersécurité d'un standard élevé tout en sensibilisant et formant les individus, des plus jeunes aux professionnels en entreprise, à travers nos programmes complets de formation et de sensibilisation.",
      p3: "Consciente de la rareté des professionnels qualifiés dans ce domaine, Cyber PolCo s'engage à répondre à la demande croissante de services spécialisés dans un monde toujours plus numérique et interconnecté. L'utilisation de l'intelligence artificielle et du machine learning renforce notre capacité à détecter et à réagir rapidement et efficacement aux menaces.",
      quote: "« Votre sécurité est votre priorité, heureusement, c'est aussi la nôtre. »",
    },
    en: {
      p1: "Founded in Mbujimayi, Democratic Republic of Congo, in May 2025, Cyber PolCo is registered as Cyber PolCo Ets. The company was co-founded by Léon Atunakou, a young Congolese cybersecurity student.",
      p2: "We deliver high-standard cybersecurity solutions while raising awareness and training individuals — from young people to enterprise professionals — through our comprehensive training and awareness programs.",
      p3: "Aware of the shortage of qualified professionals in this field, Cyber PolCo is committed to meeting the growing demand for specialized services in an increasingly digital and interconnected world. Our use of artificial intelligence and machine learning strengthens our ability to detect and respond to threats quickly and effectively.",
      quote: "\"Your security is your first concern, fortunately we've made it ours.\"",
    },
  } satisfies Localized<Story>,

  "about.leadership": {
    fr: {
      name: "Léon Atunakou",
      roleTitle: "Cofondateur & Directeur Technique",
      body: "Léon Atunakou a cofondé Cyber PolCo lors de sa dernière année d'université, alors qu'il poursuivait une licence en informatique spécialisée en cybersécurité, dans l'optique de rentrer dans son pays afin de participer à la révolution numérique que connaît actuellement le Congo. Son parcours académique et son expérience pratique, notamment son stage au sein de United Africa Group, lui confèrent les compétences nécessaires pour porter la vision technologique et la stratégie de Cyber PolCo.",
    },
    en: {
      name: "Léon Atunakou",
      roleTitle: "Co-founder & Chief Technical Officer",
      body: "Léon Atunakou co-founded Cyber PolCo during his final year of university, while completing a computer science degree specialized in cybersecurity, with the goal of returning to his country to take part in the digital revolution currently underway in Congo. His academic background and hands-on experience — including an internship at United Africa Group — give him the skills needed to lead Cyber PolCo's technological vision and strategy.",
    },
  } satisfies Localized<Leadership>,

  "about.sector": {
    fr: {
      body: "En RD Congo, le marché de la cybersécurité est encore naissant et peu structuré, avec une concentration des services dans la capitale. Cyber PolCo se positionne comme une réponse innovante à ce vide — à Mbujimayi, aucune entreprise n'est encore dédiée exclusivement à ce domaine, ce qui ouvre la voie à une implantation stratégique et pionnière.",
    },
    en: {
      body: "In the DRC, the cybersecurity market is still nascent and loosely structured, with services concentrated in the capital. Cyber PolCo positions itself as an innovative response to this gap — in Mbujimayi, no company is yet exclusively dedicated to this field, opening the way for a strategic, pioneering presence.",
    },
  } satisfies Localized<BodyOnly>,

  "careers.intro": {
    fr: {
      subtitle:
        "Rejoignez une équipe qui construit la cybersécurité de demain en Afrique centrale et australe.",
    },
    en: {
      subtitle: "Join a team building tomorrow's cybersecurity in Central and Southern Africa.",
    },
  } satisfies Localized<SubtitleOnly>,

  "contact.intro": {
    fr: { subtitle: "Une question, un projet, un incident à signaler ? Notre équipe vous répond." },
    en: { subtitle: "A question, a project, an incident to report? Our team is listening." },
  } satisfies Localized<SubtitleOnly>,

  "services.intro": {
    fr: {
      subtitle:
        "Cyber PolCo propose des services professionnels de cybersécurité ainsi que du consulting spécialisé pour les entreprises, institutions et particuliers.",
    },
    en: {
      subtitle:
        "Cyber PolCo offers professional cybersecurity services and specialized consulting for businesses, institutions, and individuals.",
    },
  } satisfies Localized<SubtitleOnly>,

  "footer.tagline": {
    fr: { tagline: "Votre sécurité est votre priorité, heureusement, c'est aussi la nôtre." },
    en: { tagline: "Your security is your first concern, fortunately we've made it ours." },
  } satisfies Localized<TaglineOnly>,
};

export type BlockKey = keyof typeof blockDefaults;

export async function getBlock<K extends BlockKey>(
  key: K,
  locale: "fr" | "en"
): Promise<(typeof blockDefaults)[K]["fr"]> {
  const row = await getContentBlock<(typeof blockDefaults)[K]["fr"]>(key);
  if (row) return row[locale];
  return blockDefaults[key][locale];
}

// For admin editing, where both locales are needed at once.
export async function getBlockBoth<K extends BlockKey>(
  key: K
): Promise<(typeof blockDefaults)[K]> {
  const row = await getContentBlock<(typeof blockDefaults)[K]["fr"]>(key);
  return (row ?? blockDefaults[key]) as (typeof blockDefaults)[K];
}

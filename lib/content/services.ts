import type { ServiceIconKey } from "./service-icons";
import type { TextAlign } from "@/lib/types/text-align";

export type Service = {
  slug: string;
  icon: ServiceIconKey;
  displayOrder?: number;
  fr: { name: string; tagline: string; description: string; descriptionAlign?: TextAlign; bullets: string[] };
  en: { name: string; tagline: string; description: string; descriptionAlign?: TextAlign; bullets: string[] };
};

export const services: Service[] = [
  {
    slug: "consulting",
    icon: "shield",
    fr: {
      name: "Consulting en cybersécurité",
      tagline: "Une stratégie de sécurité taillée pour votre organisation.",
      description:
        "Nos consultants évaluent la posture de sécurité de votre organisation, identifient les vulnérabilités et vous accompagnent dans la mise en place de politiques, processus et outils adaptés à votre réalité opérationnelle et réglementaire.",
      bullets: [
        "Audit de sécurité et évaluation des risques",
        "Élaboration de politiques et procédures de sécurité",
        "Accompagnement à la mise en conformité",
        "Conseil stratégique pour dirigeants et responsables IT",
      ],
    },
    en: {
      name: "Cybersecurity Consulting",
      tagline: "A security strategy built for your organization.",
      description:
        "Our consultants assess your organization's security posture, identify vulnerabilities, and guide you through implementing policies, processes, and tools suited to your operational and regulatory reality.",
      bullets: [
        "Security audits and risk assessments",
        "Security policy and procedure development",
        "Compliance readiness support",
        "Strategic advisory for executives and IT leaders",
      ],
    },
  },
  {
    slug: "soc-mssp",
    icon: "radar",
    fr: {
      name: "SOC / MSSP",
      tagline: "Une surveillance continue de vos systèmes, jour et nuit.",
      description:
        "Notre Centre des Opérations de Sécurité (SOC) surveille en continu votre infrastructure numérique pour détecter, analyser et répondre aux menaces avant qu'elles ne deviennent des incidents. En tant que fournisseur de services de sécurité managés (MSSP), nous devenons le prolongement de votre équipe IT.",
      bullets: [
        "Surveillance continue des systèmes et réseaux",
        "Détection et réponse aux incidents",
        "Rapports réguliers et tableaux de bord de sécurité",
        "Service managé, sans besoin d'équipe interne dédiée",
      ],
    },
    en: {
      name: "SOC / MSSP",
      tagline: "Continuous monitoring of your systems, day and night.",
      description:
        "Our Security Operations Center (SOC) continuously monitors your digital infrastructure to detect, analyze, and respond to threats before they become incidents. As a Managed Security Service Provider (MSSP), we become an extension of your IT team.",
      bullets: [
        "Continuous monitoring of systems and networks",
        "Incident detection and response",
        "Regular reporting and security dashboards",
        "Fully managed — no dedicated in-house team required",
      ],
    },
  },
  {
    slug: "starlink-deployment",
    icon: "satellite-dish",
    fr: {
      name: "Déploiement Starlink",
      tagline: "Une connexion internet fiable, même dans les zones les plus reculées.",
      description:
        "Nous installons, configurons et maintenons des kits Starlink pour garantir une connectivité internet stable aux entreprises, institutions et communautés, y compris dans les régions mal desservies par les réseaux traditionnels.",
      bullets: [
        "Installation et configuration de kits Starlink",
        "Optimisation du réseau et de la connectivité",
        "Maintenance et support technique continu",
        "Solutions adaptées aux zones reculées ou mal desservies",
      ],
    },
    en: {
      name: "Starlink Deployment",
      tagline: "Reliable internet connectivity, even in the most remote areas.",
      description:
        "We install, configure, and maintain Starlink kits to deliver stable internet connectivity for businesses, institutions, and communities — including in regions poorly served by traditional networks.",
      bullets: [
        "Starlink kit installation and configuration",
        "Network setup and connectivity optimization",
        "Ongoing maintenance and technical support",
        "Tailored solutions for remote or underserved areas",
      ],
    },
  },
  {
    slug: "trainings",
    icon: "graduation-cap",
    fr: {
      name: "Formations et sensibilisation",
      tagline: "Faire de chaque employé la première ligne de défense.",
      description:
        "Nos programmes de formation et de sensibilisation s'adressent aussi bien aux jeunes qu'aux professionnels en entreprise. Nous croyons que la cybersécurité est une responsabilité collective — nos sessions donnent à chacun les connaissances nécessaires pour protéger ses actifs numériques.",
      bullets: [
        "Programmes de sensibilisation en entreprise",
        "Sessions destinées aux écoles et universités",
        "Ateliers pratiques sur le phishing, les mots de passe, les VPN",
        "Contenus disponibles en formule mensuelle ou par session",
      ],
    },
    en: {
      name: "Trainings & Awareness",
      tagline: "Making every employee the first line of defense.",
      description:
        "Our training and awareness programs are designed for young people and business professionals alike. We believe cybersecurity is a collective responsibility — our sessions give everyone the knowledge they need to protect their digital assets.",
      bullets: [
        "Corporate awareness programs",
        "Sessions for schools and universities",
        "Hands-on workshops on phishing, passwords, and VPNs",
        "Available as a monthly program or per-session booking",
      ],
    },
  },
  {
    slug: "background-checks",
    icon: "search-check",
    fr: {
      name: "Background Checks",
      tagline: "Vérifiez en confiance avant d'engager ou de vous engager.",
      description:
        "Nous menons des vérifications d'antécédents rigoureuses pour les entreprises et les particuliers, afin de sécuriser vos décisions d'embauche, de partenariat ou de transaction.",
      bullets: [
        "Vérification d'identité et d'antécédents",
        "Rapports clairs et confidentiels",
        "Service disponible pour entreprises et particuliers",
      ],
    },
    en: {
      name: "Background Checks",
      tagline: "Verify with confidence before you hire or partner.",
      description:
        "We conduct rigorous background checks for organizations and individuals, helping you make safer hiring, partnership, or transaction decisions.",
      bullets: [
        "Identity and background verification",
        "Clear, confidential reporting",
        "Available for organizations and individuals",
      ],
    },
  },
  {
    slug: "other-services",
    icon: "layers",
    fr: {
      name: "Autres services",
      tagline: "Une réponse sur mesure à vos besoins spécifiques.",
      description:
        "Au-delà de notre offre principale, nous concevons des solutions ponctuelles pour répondre à des besoins spécifiques : réponse à incident, analyse de preuves numériques, revue de sécurité d'applications, ou accompagnement de projets numériques. Parlez-nous de votre besoin.",
      bullets: [
        "Réponse à incident et assistance d'urgence",
        "Analyse de preuves numériques (forensics)",
        "Revue de sécurité d'applications et de systèmes",
        "Projets sur mesure — contactez-nous pour en discuter",
      ],
    },
    en: {
      name: "Other Services",
      tagline: "A tailored response to your specific needs.",
      description:
        "Beyond our core offering, we design one-off solutions for specific needs: incident response, digital forensics, application and systems security review, or support for digital transformation projects. Tell us what you need.",
      bullets: [
        "Incident response and emergency assistance",
        "Digital forensics and evidence analysis",
        "Application and systems security review",
        "Custom engagements — get in touch to discuss",
      ],
    },
  },
];

export function getServiceBySlug(slug: string) {
  return services.find((s) => s.slug === slug);
}

export type TemplateKey =
  | "contact_ack"
  | "apply_ack"
  | "starlink_reminder"
  | "starlink_help_notify_technician";

type LocalizedTemplateContent = { subject: string; body: string };

type TemplateDefinition = {
  label: string;
  description: string;
  variables: string[];
  defaultFr: LocalizedTemplateContent;
  defaultEn: LocalizedTemplateContent;
};

export const TEMPLATE_KEYS: TemplateKey[] = [
  "contact_ack",
  "apply_ack",
  "starlink_reminder",
  "starlink_help_notify_technician",
];

// Single source of truth for which templates exist. The admin list page
// renders from this registry, not from arbitrary DB rows, so the UI can
// never show a stray or missing template — see lib/db/templates.ts's
// fallback to defaultFr/defaultEn when a row hasn't been seeded/edited yet.
export const TEMPLATE_REGISTRY: Record<TemplateKey, TemplateDefinition> = {
  contact_ack: {
    label: "Contact form acknowledgement",
    description: "Sent to a visitor right after they submit the contact form.",
    variables: ["firstName", "subject"],
    defaultFr: {
      subject: "Nous avons bien reçu votre message",
      body: `<h2>Merci de nous avoir contactés, {{firstName}}</h2>
        <p>Nous avons bien reçu votre message concernant : <strong>{{subject}}</strong>.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <p>— L'équipe Cyber PolCo</p>`,
    },
    defaultEn: {
      subject: "We've received your message",
      body: `<h2>Thank you for contacting us, {{firstName}}</h2>
        <p>We've received your message regarding: <strong>{{subject}}</strong>.</p>
        <p>Our team will get back to you shortly.</p>
        <p>— The Cyber PolCo team</p>`,
    },
  },
  apply_ack: {
    label: "Job application acknowledgement",
    description: "Sent to a candidate right after they submit a job application.",
    variables: ["name", "jobTitle"],
    defaultFr: {
      subject: "Votre candidature a bien été reçue",
      body: `<h2>Merci pour votre candidature, {{name}}</h2>
        <p>Nous avons bien reçu votre candidature pour le poste de <strong>{{jobTitle}}</strong>.</p>
        <p>Notre équipe RH examinera votre dossier et vous recontactera si votre profil correspond.</p>
        <p>— L'équipe Cyber PolCo</p>`,
    },
    defaultEn: {
      subject: "Your application has been received",
      body: `<h2>Thank you for applying, {{name}}</h2>
        <p>We've received your application for the <strong>{{jobTitle}}</strong> position.</p>
        <p>Our HR team will review your profile and reach out if it's a match.</p>
        <p>— The Cyber PolCo team</p>`,
    },
  },
  // Historically sent as one bilingual email (both languages stacked in a
  // single HTML with one shared subject) — fr.subject/en.subject are kept
  // identical here on purpose. See renderBilingualTemplate in
  // lib/email/templates.ts for how fr.body/en.body are composed together.
  starlink_reminder: {
    label: "Starlink subscription renewal reminder",
    description:
      "Sent 7 days before a site's Starlink subscription renews (daily cron). Bilingual: both the French and English body below are sent together in one email, so edit both.",
    variables: ["clientName", "siteName", "expiryDate"],
    defaultFr: {
      subject: "Rappel : votre abonnement Starlink expire bientôt / Reminder: your Starlink subscription expires soon",
      body: `<h2>Bonjour {{clientName}},</h2>
      <p>Votre abonnement Starlink pour le site <strong>{{siteName}}</strong> expirera le <strong>{{expiryDate}}</strong>, dans 7 jours.</p>
      <p>Pour éviter toute interruption de service, veuillez contacter notre équipe pour renouveler votre abonnement :</p>
      <ul>
        <li>Email : <a href="mailto:info@cyberpolco.com">info@cyberpolco.com</a></li>
        <li>WhatsApp RDC : <a href="https://wa.me/243828117710">https://wa.me/243828117710</a></li>
        <li>WhatsApp Namibie : <a href="https://wa.me/264812314352">https://wa.me/264812314352</a></li>
      </ul>
      <p>— L'équipe Cyber PolCo</p>`,
    },
    defaultEn: {
      subject: "Rappel : votre abonnement Starlink expire bientôt / Reminder: your Starlink subscription expires soon",
      body: `<h2>Hello {{clientName}},</h2>
      <p>Your Starlink subscription for site <strong>{{siteName}}</strong> will expire on <strong>{{expiryDate}}</strong>, in 7 days.</p>
      <p>To avoid any service interruption, please contact our team to renew your subscription:</p>
      <ul>
        <li>Email: <a href="mailto:info@cyberpolco.com">info@cyberpolco.com</a></li>
        <li>WhatsApp DRC: <a href="https://wa.me/243828117710">https://wa.me/243828117710</a></li>
        <li>WhatsApp Namibia: <a href="https://wa.me/264812314352">https://wa.me/264812314352</a></li>
      </ul>
      <p>— The Cyber PolCo team</p>`,
    },
  },
  starlink_help_notify_technician: {
    label: "Technician alert — client requested help",
    description: "Sent to every technician and super admin when a Starlink client requests on-site assistance.",
    variables: ["clientName", "clientId", "siteName"],
    defaultFr: {
      subject: "Nouvelle demande d'assistance Starlink",
      body: `<p>{{clientName}} ({{clientId}}) a besoin d'assistance sur le site <strong>{{siteName}}</strong>.</p>`,
    },
    defaultEn: {
      subject: "New Starlink assistance request",
      body: `<p>{{clientName}} ({{clientId}}) needs assistance at site <strong>{{siteName}}</strong>.</p>`,
    },
  },
};

import { contactEmails, offices } from "@/lib/content/company";

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const whatsappCD = offices.find((o) => o.country === "CD")?.whatsapp ?? "";
const whatsappNA = offices.find((o) => o.country === "NA")?.whatsapp ?? "";

export function buildSubscriptionReminderEmail({
  clientName,
  siteName,
  expiryDateFr,
  expiryDateEn,
}: {
  clientName: string;
  siteName: string;
  expiryDateFr: string;
  expiryDateEn: string;
}): { subject: string; html: string } {
  const name = escapeHtml(clientName);
  const site = escapeHtml(siteName);

  return {
    subject: "Rappel : votre abonnement Starlink expire bientôt / Reminder: your Starlink subscription expires soon",
    html: `
      <h2>Bonjour ${name},</h2>
      <p>Votre abonnement Starlink pour le site <strong>${site}</strong> expirera le <strong>${expiryDateFr}</strong>, dans 7 jours.</p>
      <p>Pour éviter toute interruption de service, veuillez contacter notre équipe pour renouveler votre abonnement :</p>
      <ul>
        <li>Email : <a href="mailto:${contactEmails.info}">${contactEmails.info}</a></li>
        <li>WhatsApp RDC : <a href="${whatsappCD}">${whatsappCD}</a></li>
        <li>WhatsApp Namibie : <a href="${whatsappNA}">${whatsappNA}</a></li>
      </ul>
      <p>— L'équipe Cyber PolCo</p>
      <hr />
      <h2>Hello ${name},</h2>
      <p>Your Starlink subscription for site <strong>${site}</strong> will expire on <strong>${expiryDateEn}</strong>, in 7 days.</p>
      <p>To avoid any service interruption, please contact our team to renew your subscription:</p>
      <ul>
        <li>Email: <a href="mailto:${contactEmails.info}">${contactEmails.info}</a></li>
        <li>WhatsApp DRC: <a href="${whatsappCD}">${whatsappCD}</a></li>
        <li>WhatsApp Namibia: <a href="${whatsappNA}">${whatsappNA}</a></li>
      </ul>
      <p>— The Cyber PolCo team</p>
    `,
  };
}

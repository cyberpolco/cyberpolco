import { getTechnicianEmails, getSuperAdminEmails } from "@/lib/db/users";
import { sendTemplatedEmail } from "@/lib/email/templates";
import { escapeHtml } from "@/lib/email/escape-html";

export async function notifyTechniciansOfHelpRequest(vars: {
  clientName: string;
  clientId: string;
  siteName: string;
}): Promise<void> {
  const [technicianEmails, superAdminEmails] = await Promise.all([getTechnicianEmails(), getSuperAdminEmails()]);
  // Deduplicated in case the same address somehow holds both roles.
  const emails = Array.from(new Set([...technicianEmails, ...superAdminEmails]));
  const safeVars = {
    clientName: escapeHtml(vars.clientName),
    clientId: escapeHtml(vars.clientId),
    siteName: escapeHtml(vars.siteName),
  };

  for (const email of emails) {
    // Email channel — always sent today.
    try {
      await sendTemplatedEmail({
        key: "starlink_help_notify_technician",
        to: email,
        from: "Cyber PolCo <notify@cyberpolco.com>",
        locale: "fr",
        vars: safeVars,
      });
    } catch (err) {
      console.error(`Failed to email technician ${email} about help request:`, err);
    }

    // SMS channel — LATER PHASE. Add here, inside the same per-recipient
    // loop, once technician phone numbers + an SMS provider exist:
    // if (technician.phone) {
    //   try { await sendSms({ to: technician.phone, ... }); }
    //   catch (err) { console.error(...); }
    // }
  }
}

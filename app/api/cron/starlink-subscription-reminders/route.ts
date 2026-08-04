import { NextRequest, NextResponse } from "next/server";
import { getStarlinkClients, daysUntilNextRenewal } from "@/lib/db/starlink";
import { sendEmail } from "@/lib/email";
import { renderBilingualTemplate } from "@/lib/email/templates";
import { escapeHtml } from "@/lib/email/escape-html";

const REMINDER_WINDOW_DAYS = 7;

/**
 * Triggered daily by Vercel Cron (see vercel.json) — not a logged-in admin
 * request, so it's authorized via a shared secret rather than requireRole.
 * Sends a renewal reminder to every Starlink site exactly 7 days from its
 * next 30-day renewal. No "already sent today" tracking (accepted
 * trade-off — see the plan this was built from): a double-triggered run
 * would send a duplicate email that day, but nothing worse.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await getStarlinkClients();
  const now = new Date();
  const expiry = new Date(now.getTime() + REMINDER_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const expiryDateFr = expiry.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const expiryDateEn = expiry.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });

  let sent = 0;
  let failed = 0;

  for (const client of clients) {
    for (const site of client.sites) {
      if (!site.subscriptionStartDate) continue;
      if (daysUntilNextRenewal(site.subscriptionStartDate, now) !== REMINDER_WINDOW_DAYS) continue;

      try {
        const clientName = escapeHtml(client.name);
        const siteName = escapeHtml(site.siteName);
        const { subject, html } = await renderBilingualTemplate(
          "starlink_reminder",
          { clientName, siteName, expiryDate: expiryDateFr },
          { clientName, siteName, expiryDate: expiryDateEn }
        );
        await sendEmail({ to: client.email, from: "Cyber PolCo <no-reply@cyberpolco.com>", subject, html });
        sent++;
      } catch (err) {
        console.error(`Failed to send subscription reminder for site ${site.id}:`, err);
        failed++;
      }
    }
  }

  return NextResponse.json({ ok: true, sent, failed });
}

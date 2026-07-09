/**
 * Sends transactional email via Resend when RESEND_API_KEY is configured.
 * Falls back to logging to the console so the app works end-to-end in local
 * development without any external account set up.
 */

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Cyber PolCo <notifications@cyberpolco.com>";

  if (!apiKey) {
    console.log("[email:dev-fallback] RESEND_API_KEY not set — logging instead of sending.");
    console.log({ to, subject, html });
    return { simulated: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend error (${res.status}): ${text}`);
  }

  return res.json();
}

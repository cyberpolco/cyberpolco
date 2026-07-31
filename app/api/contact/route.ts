import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/schemas";
import { addInquiry } from "@/lib/db/inquiries";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = await checkRateLimit(`contact:${ip}`, 5, 60_000);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Honeypot: bots that fill every field trip this. Silently pretend success.
  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const captchaOk = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json({ error: "CAPTCHA verification failed. Please try again." }, { status: 400 });
  }

  const { firstName, lastName, company, position, email, subject, message, locale } = parsed.data;
  const name = `${firstName} ${lastName}`;

  let inquiry;
  try {
    inquiry = await addInquiry({ name, company, position, email, subject, message });
  } catch (err) {
    console.error("Failed to save contact inquiry:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  try {
    await sendEmail({
      to: email,
      from: "Cyber PolCo <no-reply@cyberpolco.com>",
      subject:
        locale === "fr" ? "Nous avons bien reçu votre message" : "We've received your message",
      html:
        locale === "fr"
          ? `
        <h2>Merci de nous avoir contactés, ${escapeHtml(firstName)}</h2>
        <p>Nous avons bien reçu votre message concernant : <strong>${escapeHtml(subject)}</strong>.</p>
        <p>Notre équipe vous répondra dans les plus brefs délais.</p>
        <p>— L'équipe Cyber PolCo</p>
      `
          : `
        <h2>Thank you for contacting us, ${escapeHtml(firstName)}</h2>
        <p>We've received your message regarding: <strong>${escapeHtml(subject)}</strong>.</p>
        <p>Our team will get back to you shortly.</p>
        <p>— The Cyber PolCo team</p>
      `,
    });
  } catch (err) {
    console.error("Failed to send contact acknowledgement email:", err);
  }

  return NextResponse.json({ ok: true, id: inquiry.id });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

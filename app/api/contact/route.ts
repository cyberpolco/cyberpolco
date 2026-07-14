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

  const { firstName, lastName, company, position, email, subject, message } = parsed.data;
  const name = `${firstName} ${lastName}`;

  const inquiry = await addInquiry({ name, company, position, email, subject, message });

  await sendEmail({
    to: process.env.ADMIN_EMAIL || "info@cyberpolco.com",
    subject: `New inquiry: ${subject}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Company:</strong> ${escapeHtml(company)}</p>
      <p><strong>Position:</strong> ${escapeHtml(position)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
    `,
  });

  return NextResponse.json({ ok: true, id: inquiry.id });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

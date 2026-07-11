import { NextRequest, NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/schemas";
import { addInquiry } from "@/lib/db/inquiries";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = checkRateLimit(`contact:${ip}`, 5, 60_000);
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

  // TODO: verify parsed.data.turnstileToken against Cloudflare's siteverify
  // endpoint once NEXT_PUBLIC_TURNSTILE_SITE_KEY / TURNSTILE_SECRET_KEY are
  // configured. See README.md -> "Enabling CAPTCHA".

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

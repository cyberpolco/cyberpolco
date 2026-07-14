import { NextRequest, NextResponse } from "next/server";
import { applicationSchema, ALLOWED_CV_TYPES, MAX_CV_SIZE_BYTES } from "@/lib/validation/schemas";
import { addApplication } from "@/lib/db/applications";
import { storeCvFile } from "@/lib/db/file-storage";
import { sendEmail } from "@/lib/email";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const rate = await checkRateLimit(`apply:${ip}`, 5, 60_000);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  const formData = await req.formData();
  const raw = Object.fromEntries(formData.entries());

  const parsed = applicationSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (parsed.data.website) {
    return NextResponse.json({ ok: true });
  }

  const captchaOk = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json({ error: "CAPTCHA verification failed. Please try again." }, { status: 400 });
  }

  const cv = formData.get("cv");
  if (!(cv instanceof File) || cv.size === 0) {
    return NextResponse.json({ error: "A CV file is required." }, { status: 400 });
  }
  if (!ALLOWED_CV_TYPES.includes(cv.type)) {
    return NextResponse.json(
      { error: "CV must be a PDF or DOCX file." },
      { status: 400 }
    );
  }
  if (cv.size > MAX_CV_SIZE_BYTES) {
    return NextResponse.json({ error: "CV must be under 5MB." }, { status: 400 });
  }

  const { url, fileName } = await storeCvFile(cv);

  const { jobSlug, jobTitle, name, email, phone, message } = parsed.data;

  const application = await addApplication({
    jobSlug,
    jobTitle,
    name,
    email,
    phone,
    message: message || "",
    cvFileName: fileName,
    cvUrl: url,
  });

  await sendEmail({
    to: process.env.ADMIN_EMAIL || "info@cyberpolco.com",
    subject: `New application: ${jobTitle}`,
    html: `
      <h2>New job application</h2>
      <p><strong>Role:</strong> ${escapeHtml(jobTitle)}</p>
      <p><strong>Name:</strong> ${escapeHtml(name)}</p>
      <p><strong>Email:</strong> ${escapeHtml(email)}</p>
      <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
      <p><strong>CV:</strong> ${escapeHtml(fileName)} (${escapeHtml(url)})</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(message || "").replace(/\n/g, "<br/>")}</p>
    `,
  });

  return NextResponse.json({ ok: true, id: application.id });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

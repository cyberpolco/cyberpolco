import { NextRequest, NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation/schemas";
import { addApplication } from "@/lib/db/applications";
import { getJobBySlug, getEffectiveJobStatus } from "@/lib/db/jobs";
import { sendEmail } from "@/lib/email";
import { renderTemplate } from "@/lib/email/templates";
import { escapeHtml } from "@/lib/email/escape-html";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

// The CV is uploaded straight from the browser to Blob storage (see
// lib/blob-client-upload.ts) before this route ever sees the request, so
// here we only need to check the resulting URL actually points at our own
// Blob store under the expected prefix, not at something an attacker typed in.
function isValidCvUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith(".public.blob.vercel-storage.com") && parsed.pathname.startsWith("/cvs/");
  } catch {
    return false;
  }
}

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

  const job = await getJobBySlug(parsed.data.jobSlug);
  if (!job || getEffectiveJobStatus(job) !== "open") {
    return NextResponse.json({ error: "This position is no longer accepting applications." }, { status: 400 });
  }

  const captchaOk = await verifyTurnstileToken(parsed.data.turnstileToken, ip);
  if (!captchaOk) {
    return NextResponse.json({ error: "CAPTCHA verification failed. Please try again." }, { status: 400 });
  }

  const url = String(formData.get("cvUrl") || "");
  const fileName = String(formData.get("cvFileName") || "");
  if (!url || !fileName || !isValidCvUrl(url)) {
    return NextResponse.json({ error: "A CV file is required." }, { status: 400 });
  }

  const { jobSlug, jobTitle, name, email, phone, message, locale } = parsed.data;

  let application;
  try {
    application = await addApplication({
      jobSlug,
      jobTitle,
      name,
      email,
      phone,
      message: message || "",
      cvFileName: fileName,
      cvUrl: url,
    });
  } catch (err) {
    console.error("Failed to save job application:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  try {
    const { subject, html } = await renderTemplate("apply_ack", locale, {
      name: escapeHtml(name),
      jobTitle: escapeHtml(jobTitle),
    });
    await sendEmail({ to: email, from: "Cyber PolCo <no-reply@cyberpolco.com>", subject, html });
  } catch (err) {
    console.error("Failed to send application acknowledgement email:", err);
  }

  return NextResponse.json({ ok: true, id: application.id });
}

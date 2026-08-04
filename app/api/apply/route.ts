import { NextRequest, NextResponse } from "next/server";
import { applicationSchema } from "@/lib/validation/schemas";
import { addApplication } from "@/lib/db/applications";
import { getJobBySlug, getEffectiveJobStatus } from "@/lib/db/jobs";
import { sendEmail } from "@/lib/email";
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
    await sendEmail({
      to: email,
      from: "Cyber PolCo <no-reply@cyberpolco.com>",
      subject:
        locale === "fr" ? "Votre candidature a bien été reçue" : "Your application has been received",
      html:
        locale === "fr"
          ? `
        <h2>Merci pour votre candidature, ${escapeHtml(name)}</h2>
        <p>Nous avons bien reçu votre candidature pour le poste de <strong>${escapeHtml(jobTitle)}</strong>.</p>
        <p>Notre équipe RH examinera votre dossier et vous recontactera si votre profil correspond.</p>
        <p>— L'équipe Cyber PolCo</p>
      `
          : `
        <h2>Thank you for applying, ${escapeHtml(name)}</h2>
        <p>We've received your application for the <strong>${escapeHtml(jobTitle)}</strong> position.</p>
        <p>Our HR team will review your profile and reach out if it's a match.</p>
        <p>— The Cyber PolCo team</p>
      `,
    });
  } catch (err) {
    console.error("Failed to send application acknowledgement email:", err);
  }

  return NextResponse.json({ ok: true, id: application.id });
}

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ApplicationForm({
  jobSlug,
  jobTitle,
  locale,
}: {
  jobSlug: string;
  jobTitle: string;
  locale: "fr" | "en";
}) {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("jobSlug", jobSlug);
    formData.set("jobTitle", jobTitle);

    try {
      const res = await fetch("/api/apply", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-6 text-brand-dark">
        {locale === "fr"
          ? "Merci ! Votre candidature a bien été envoyée."
          : "Thank you! Your application has been submitted."}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
      {/* Honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

      <div>
        <label htmlFor="apply-name" className="mb-1 block text-sm font-medium text-brand-dark">
          {locale === "fr" ? "Nom complet" : "Full name"}
        </label>
        <input
          id="apply-name"
          name="name"
          required
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="apply-email" className="mb-1 block text-sm font-medium text-brand-dark">
            {t("formEmail")}
          </label>
          <input
            id="apply-email"
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label htmlFor="apply-phone" className="mb-1 block text-sm font-medium text-brand-dark">
            {locale === "fr" ? "Téléphone" : "Phone"}
          </label>
          <input
            id="apply-phone"
            name="phone"
            required
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
          />
        </div>
      </div>
      <div>
        <label htmlFor="apply-cv" className="mb-1 block text-sm font-medium text-brand-dark">
          {locale === "fr" ? "CV (PDF ou DOCX, 5 Mo max)" : "CV/Resume (PDF or DOCX, max 5MB)"}
        </label>
        <input
          id="apply-cv"
          type="file"
          name="cv"
          accept=".pdf,.docx"
          required
          className="w-full rounded-lg border border-black/10 px-4 py-2 text-sm outline-none focus:border-brand-blue"
        />
      </div>
      <div>
        <label htmlFor="apply-message" className="mb-1 block text-sm font-medium text-brand-dark">
          {locale === "fr" ? "Message (optionnel)" : "Message (optional)"}
        </label>
        <textarea
          id="apply-message"
          name="message"
          rows={4}
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-brand-red">{errorMsg || t("formError")}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {status === "loading"
          ? "..."
          : locale === "fr"
            ? "Envoyer ma candidature"
            : "Submit application"}
      </button>
    </form>
  );
}

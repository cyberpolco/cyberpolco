"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { contactSchema, isFreeEmailDomain } from "@/lib/validation/schemas";
import TurnstileWidget from "./TurnstileWidget";

type FieldName = "firstName" | "lastName" | "company" | "position" | "email" | "subject" | "message";

const FIELDS: FieldName[] = ["firstName", "lastName", "company", "position", "email", "subject", "message"];

export default function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [turnstileToken, setTurnstileToken] = useState("");
  const captchaRequired = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  function messageFor(field: FieldName, rawEmail: string): string {
    if (field === "email") {
      return isFreeEmailDomain(rawEmail) ? t("errorEmailWorkOnly") : t("errorEmailInvalid");
    }
    if (field === "message") {
      return t("errorMessageTooShort");
    }
    return t("errorRequired");
  }

  function clearError(field: FieldName) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const data = { ...raw, turnstileToken } as Record<string, string>;

    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      const nextErrors: Partial<Record<FieldName, string>> = {};
      for (const field of FIELDS) {
        if (fieldErrors[field]?.length) {
          nextErrors[field] = messageFor(field, String(data.email ?? ""));
        }
      }
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error();
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-6 text-brand-dark">
        {t("formSuccess")}
      </div>
    );
  }

  const inputClass = (field: FieldName) =>
    `w-full rounded-lg border px-4 py-2.5 outline-none focus:border-brand-blue ${
      errors[field] ? "border-brand-red" : "border-black/10"
    }`;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Honeypot field — bots that fill hidden fields trip this */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-firstName" className="mb-1 block text-sm font-medium text-brand-dark">
            {t("formFirstName")}
          </label>
          <input
            id="contact-firstName"
            name="firstName"
            required
            onChange={() => clearError("firstName")}
            className={inputClass("firstName")}
          />
          {errors.firstName && <p className="mt-1 text-sm text-brand-red">{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="contact-lastName" className="mb-1 block text-sm font-medium text-brand-dark">
            {t("formLastName")}
          </label>
          <input
            id="contact-lastName"
            name="lastName"
            required
            onChange={() => clearError("lastName")}
            className={inputClass("lastName")}
          />
          {errors.lastName && <p className="mt-1 text-sm text-brand-red">{errors.lastName}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-company" className="mb-1 block text-sm font-medium text-brand-dark">
            {t("formCompany")}
          </label>
          <input
            id="contact-company"
            name="company"
            required
            onChange={() => clearError("company")}
            className={inputClass("company")}
          />
          {errors.company && <p className="mt-1 text-sm text-brand-red">{errors.company}</p>}
        </div>
        <div>
          <label htmlFor="contact-position" className="mb-1 block text-sm font-medium text-brand-dark">
            {t("formPosition")}
          </label>
          <input
            id="contact-position"
            name="position"
            required
            onChange={() => clearError("position")}
            className={inputClass("position")}
          />
          {errors.position && <p className="mt-1 text-sm text-brand-red">{errors.position}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="contact-email" className="mb-1 block text-sm font-medium text-brand-dark">
          {t("formEmail")}
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          onChange={() => clearError("email")}
          className={inputClass("email")}
        />
        {errors.email && <p className="mt-1 text-sm text-brand-red">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="contact-subject" className="mb-1 block text-sm font-medium text-brand-dark">
          {t("formSubject")}
        </label>
        <input
          id="contact-subject"
          name="subject"
          required
          onChange={() => clearError("subject")}
          className={inputClass("subject")}
        />
        {errors.subject && <p className="mt-1 text-sm text-brand-red">{errors.subject}</p>}
      </div>

      <div>
        <label htmlFor="contact-message" className="mb-1 block text-sm font-medium text-brand-dark">
          {t("formMessage")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          onChange={() => clearError("message")}
          className={inputClass("message")}
        />
        {errors.message && <p className="mt-1 text-sm text-brand-red">{errors.message}</p>}
      </div>

      <TurnstileWidget onVerify={setTurnstileToken} onExpire={() => setTurnstileToken("")} />

      {status === "error" && <p className="text-sm text-brand-red">{t("formError")}</p>}

      <button
        type="submit"
        disabled={status === "loading" || (captchaRequired && !turnstileToken)}
        className="w-full rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "..." : t("formSubmit")}
      </button>
    </form>
  );
}

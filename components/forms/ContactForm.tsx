"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export default function ContactForm() {
  const t = useTranslations("contact");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field — bots that fill hidden fields trip this */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">{t("formName")}</label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">{t("formEmail")}</label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">{t("formCompany")}</label>
          <input
            name="company"
            required
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark">{t("formPosition")}</label>
          <input
            name="position"
            required
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">{t("formSubject")}</label>
        <input
          name="subject"
          required
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">{t("formMessage")}</label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
        />
      </div>

      {/*
        Cloudflare Turnstile widget goes here once NEXT_PUBLIC_TURNSTILE_SITE_KEY
        is configured — see README.md → "Enabling CAPTCHA". Omitted by default
        so the form works end-to-end without any external account set up.
      */}

      {status === "error" && <p className="text-sm text-brand-red">{t("formError")}</p>}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "..." : t("formSubmit")}
      </button>
    </form>
  );
}

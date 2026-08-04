import { getTemplateRow, type LocalizedTemplateContent } from "@/lib/db/templates";
import { TEMPLATE_REGISTRY, type TemplateKey } from "./template-registry";
import { sendEmail } from "./index";

function substitute(text: string, vars: Record<string, string>): string {
  return text.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, name) => vars[name] ?? "");
}

// Falls back to the code-defined default if the DB row is missing (e.g. a
// fresh environment before the seed migration has run) — mirrors
// sendEmail's own "works even without external setup" fallback philosophy.
async function getTemplateContent(
  key: TemplateKey
): Promise<{ fr: LocalizedTemplateContent; en: LocalizedTemplateContent }> {
  const row = await getTemplateRow(key);
  if (row) return { fr: row.fr, en: row.en };
  const def = TEMPLATE_REGISTRY[key];
  return { fr: def.defaultFr, en: def.defaultEn };
}

// vars must already contain pre-escaped values for anything user-supplied —
// this function does plain substitution only, it doesn't know which vars
// are untrusted.
export async function renderTemplate(
  key: TemplateKey,
  locale: "fr" | "en",
  vars: Record<string, string>
): Promise<{ subject: string; html: string }> {
  const content = await getTemplateContent(key);
  const localized = content[locale];
  return { subject: substitute(localized.subject, vars), html: substitute(localized.body, vars) };
}

// Special-cased composition for the one bilingual-single-email template
// (starlink_reminder) — both languages are sent stacked in one email with a
// shared subject.
export async function renderBilingualTemplate(
  key: TemplateKey,
  varsFr: Record<string, string>,
  varsEn: Record<string, string>
): Promise<{ subject: string; html: string }> {
  const content = await getTemplateContent(key);
  const fr = substitute(content.fr.body, varsFr);
  const en = substitute(content.en.body, varsEn);
  return { subject: substitute(content.fr.subject, varsFr), html: `${fr}<hr />${en}` };
}

export async function sendTemplatedEmail(input: {
  key: TemplateKey;
  to: string;
  from?: string;
  locale: "fr" | "en";
  vars: Record<string, string>;
}) {
  const { subject, html } = await renderTemplate(input.key, input.locale, input.vars);
  return sendEmail({ to: input.to, from: input.from, subject, html });
}

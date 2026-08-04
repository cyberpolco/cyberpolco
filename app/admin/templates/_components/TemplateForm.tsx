import { updateTemplateAction } from "@/lib/actions/templates";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import type { TemplateKey } from "@/lib/email/template-registry";
import type { LocalizedTemplateContent } from "@/lib/db/templates";

export default function TemplateForm({
  templateKey,
  content,
}: {
  templateKey: TemplateKey;
  content: { fr: LocalizedTemplateContent; en: LocalizedTemplateContent };
}) {
  return (
    <form action={updateTemplateAction} className="space-y-6">
      <input type="hidden" name="key" value={templateKey} />

      <div className="grid gap-8 md:grid-cols-2">
        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">Français</legend>
          <Field label="Sujet" name="subject_fr" defaultValue={content.fr.subject} />
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Contenu (HTML)</label>
            <textarea
              name="body_fr"
              defaultValue={content.fr.body}
              required
              rows={12}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 font-mono text-xs dark:bg-white/5 dark:text-white"
            />
          </div>
        </fieldset>

        <fieldset className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 p-5">
          <legend className="px-1 text-sm font-semibold text-brand-blue">English</legend>
          <Field label="Subject" name="subject_en" defaultValue={content.en.subject} />
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Content (HTML)</label>
            <textarea
              name="body_en"
              defaultValue={content.en.body}
              required
              rows={12}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 font-mono text-xs dark:bg-white/5 dark:text-white"
            />
          </div>
        </fieldset>
      </div>

      <SubmitButton>Save template</SubmitButton>
    </form>
  );
}

function Field({ label, name, defaultValue }: { label: string; name: string; defaultValue?: string }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required
        className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
      />
    </div>
  );
}

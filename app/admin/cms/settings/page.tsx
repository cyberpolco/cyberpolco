import { getSettings } from "@/lib/db/settings";
import { getPendingChangeForTarget } from "@/lib/db/pending-changes";
import { updateSettingsAction } from "@/lib/actions/settings";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  await requireRole(["super_admin", "content_editor"]);
  const { pending } = await searchParams;

  const [settings, pendingChange] = await Promise.all([
    getSettings(),
    getPendingChangeForTarget("settings", "singleton"),
  ]);

  return (
    <div>
      <BackLink href="/admin/cms" label="Back to CMS" />

      {(pending === "1" || pendingChange) && (
        <div className="mt-4 rounded-xl bg-brand-blue/10 p-4 text-sm text-brand-dark dark:text-white">
          {pending === "1"
            ? "Your changes have been submitted for super_admin approval."
            : "There's a change to these settings awaiting super_admin approval."}
        </div>
      )}

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Settings</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Social media links. Homepage stats live under CMS → Pages → Home, and office contact
        info under CMS → Footer.
      </p>

      <form action={updateSettingsAction} className="mt-8 space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-brand-dark dark:text-white">Social links</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SocialField label="X (Twitter)" name="social_x" defaultValue={settings.socialLinks.x} />
            <SocialField label="LinkedIn" name="social_linkedin" defaultValue={settings.socialLinks.linkedin} />
            <SocialField label="TikTok" name="social_tiktok" defaultValue={settings.socialLinks.tiktok} />
            <SocialField label="YouTube" name="social_youtube" defaultValue={settings.socialLinks.youtube} />
            <SocialField label="GitHub" name="social_github" defaultValue={settings.socialLinks.github} />
            <SocialField
              label="WhatsApp channel"
              name="social_whatsapp"
              defaultValue={settings.socialLinks.whatsappChannel}
            />
          </div>
        </section>

        <SubmitButton>Save settings</SubmitButton>
      </form>
    </div>
  );
}

function SocialField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-brand-gray dark:text-white/60">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 dark:bg-white/5 dark:text-white"
      />
    </div>
  );
}

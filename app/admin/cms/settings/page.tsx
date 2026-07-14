import { getSettings } from "@/lib/db/settings";
import { updateSettingsAction } from "@/lib/actions/settings";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";

export default async function SettingsPage() {
  await requireRole(["super_admin", "content_editor"]);

  const settings = await getSettings();

  return (
    <div>
      <BackLink href="/admin/cms" label="Back to CMS" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark">Settings</h1>
      <p className="mt-1 text-brand-gray">
        Social media links. Homepage stats live under CMS → Pages → Home, and office contact
        info under CMS → Footer.
      </p>

      <form action={updateSettingsAction} className="mt-8 space-y-10">
        <section>
          <h2 className="text-lg font-semibold text-brand-dark">Social links</h2>
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

        <button
          type="submit"
          className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
        >
          Save settings
        </button>
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
      <label className="mb-1 block text-xs font-medium text-brand-gray">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-black/10 px-3 py-2"
      />
    </div>
  );
}

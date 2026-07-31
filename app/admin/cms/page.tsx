import Link from "next/link";
import { FileStack, Layers, PanelBottom, Settings, Users, Milestone } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";

const generalSections = [
  {
    href: "/admin/cms/pages",
    label: "Pages",
    description: "Edit the copy on Home, About, Services, Careers, and Contact.",
    icon: FileStack,
  },
  {
    href: "/admin/cms/footer",
    label: "Footer",
    description: "Edit the tagline and office contact info shown in the footer.",
    icon: PanelBottom,
  },
  {
    href: "/admin/cms/settings",
    label: "Settings",
    description: "Social media links.",
    icon: Settings,
  },
];

// Grouped separately from the section above: these three are structured,
// repeatable content collections (add/edit/remove individual entries), not
// one-off page copy — worth their own heading on the hub.
const contentSections = [
  {
    href: "/admin/cms/services",
    label: "Services",
    description: "Add, edit, or remove the services listed on the site.",
    icon: Layers,
  },
  {
    href: "/admin/cms/team",
    label: "Team",
    description: "Add, edit, or remove the team members shown on the About page.",
    icon: Users,
  },
  {
    href: "/admin/cms/achievements",
    label: "Achievements",
    description: "Manage the milestone timeline shown on the Achievements page.",
    icon: Milestone,
  },
];

function SectionCard(s: { href: string; label: string; description: string; icon: typeof FileStack }) {
  const Icon = s.icon;
  return (
    <Link
      href={s.href}
      className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
        <Icon size={22} />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-brand-dark dark:text-white">{s.label}</h2>
      <p className="mt-2 text-sm text-brand-gray dark:text-white/60">{s.description}</p>
    </Link>
  );
}

export default async function CmsHubPage() {
  await requireRole(["super_admin", "content_editor"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">CMS</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Everything editable about the site&apos;s content, without a redeploy.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {generalSections.map((s) => (
          <SectionCard key={s.href} {...s} />
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">
        Content
      </h2>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {contentSections.map((s) => (
          <SectionCard key={s.href} {...s} />
        ))}
      </div>
    </div>
  );
}

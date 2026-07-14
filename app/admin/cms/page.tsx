import Link from "next/link";
import { FileStack, Layers, PanelBottom, Settings } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";

const sections = [
  {
    href: "/admin/cms/pages",
    label: "Pages",
    description: "Edit the copy on Home, About, Services, Careers, and Contact.",
    icon: FileStack,
  },
  {
    href: "/admin/cms/services",
    label: "Services",
    description: "Add, edit, or remove the services listed on the site.",
    icon: Layers,
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

export default async function CmsHubPage() {
  await requireRole(["super_admin", "content_editor"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">CMS</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Everything editable about the site&apos;s content, without a redeploy.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
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
        })}
      </div>
    </div>
  );
}

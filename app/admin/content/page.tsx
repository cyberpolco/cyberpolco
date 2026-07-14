import Link from "next/link";
import { Home, User, FileStack } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";

const sections = [
  {
    href: "/admin/content/home",
    label: "Homepage",
    description: "Hero, mission, vision, and every section intro on the homepage.",
    icon: Home,
  },
  {
    href: "/admin/content/about",
    label: "About page",
    description: "Company story, leadership bio, and sector overview.",
    icon: User,
  },
  {
    href: "/admin/content/page-intros",
    label: "Page intros",
    description: "Intro subtitles for Careers, Contact, and Services.",
    icon: FileStack,
  },
];

export default async function ContentHubPage() {
  await requireRole(["super_admin", "content_editor"]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark">Content</h1>
      <p className="mt-1 text-brand-gray">
        Edit the site&apos;s business copy without a redeploy. Services are managed separately.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-2xl border border-black/5 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Icon size={22} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-brand-dark">{s.label}</h2>
              <p className="mt-2 text-sm text-brand-gray">{s.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

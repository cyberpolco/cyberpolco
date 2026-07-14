import Link from "next/link";
import { Home, User, Layers, Briefcase, Mail } from "lucide-react";
import { requireRole } from "@/lib/auth/rbac";
import BackLink from "@/app/admin/_components/BackLink";

const pages = [
  { href: "/admin/cms/pages/home", label: "Home", description: "Hero, mission, vision, and every section intro.", icon: Home },
  { href: "/admin/cms/pages/about", label: "About", description: "Company story, leadership bio, and sector overview.", icon: User },
  { href: "/admin/cms/pages/services", label: "Services", description: "Intro subtitle for the services index page.", icon: Layers },
  { href: "/admin/cms/pages/careers", label: "Careers", description: "Intro subtitle for the careers page.", icon: Briefcase },
  { href: "/admin/cms/pages/contact", label: "Contact", description: "Intro subtitle for the contact page.", icon: Mail },
];

export default async function PagesListPage() {
  await requireRole(["super_admin", "content_editor"]);

  return (
    <div>
      <BackLink href="/admin/cms" label="Back to CMS" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Pages</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">Edit the copy on each public page.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((p) => {
          const Icon = p.icon;
          return (
            <Link
              key={p.href}
              href={p.href}
              className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                <Icon size={22} />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-brand-dark dark:text-white">{p.label}</h2>
              <p className="mt-2 text-sm text-brand-gray dark:text-white/60">{p.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

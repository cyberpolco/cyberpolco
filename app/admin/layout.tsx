import type { Metadata } from "next";
import Link from "next/link";
import {
  LayoutDashboard,
  Newspaper,
  FileStack,
  Layers,
  Briefcase,
  Inbox,
  FileText,
  Settings,
  Users,
  LogOut,
} from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import type { Role } from "@/lib/auth/roles";
import "../globals.css";

export const metadata: Metadata = {
  title: "Cyber PolCo — Admin",
  robots: { index: false, follow: false },
};

const navItems: { href: string; label: string; icon: typeof LayoutDashboard; roles: Role[] }[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "content_editor", "hr_recruiter", "viewer"],
  },
  { href: "/admin/articles", label: "Articles", icon: Newspaper, roles: ["super_admin", "content_editor"] },
  { href: "/admin/content", label: "Content", icon: FileStack, roles: ["super_admin", "content_editor"] },
  { href: "/admin/services", label: "Services", icon: Layers, roles: ["super_admin", "content_editor"] },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, roles: ["super_admin", "hr_recruiter"] },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, roles: ["super_admin"] },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: FileText,
    roles: ["super_admin", "hr_recruiter"],
  },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: ["super_admin"] },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["super_admin"] },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const showChrome = Boolean(session) && !session?.mustChangePassword;
  const visibleNavItems = session
    ? navItems.filter((item) => item.roles.includes(session.role))
    : [];

  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-dark-2/5 font-sans text-brand-dark antialiased">
        {showChrome ? (
          <div className="flex min-h-screen">
            <aside className="hidden w-60 flex-col border-r border-black/5 bg-white p-5 md:flex">
              <div className="mb-8 font-display text-lg font-bold text-brand-dark">
                Cyber PolCo <span className="text-brand-red">Admin</span>
              </div>
              <nav className="flex-1 space-y-1">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-gray hover:bg-brand-blue/10 hover:text-brand-blue"
                    >
                      <Icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <form action="/api/admin/logout" method="POST">
                <button className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-gray hover:bg-brand-red/10 hover:text-brand-red">
                  <LogOut size={18} /> Log out
                </button>
              </form>
            </aside>
            <main className="flex-1 p-6 md:p-10">{children}</main>
          </div>
        ) : (
          children
        )}
      </body>
    </html>
  );
}

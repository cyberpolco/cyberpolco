import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  LayoutDashboard,
  Newspaper,
  FileStack,
  Briefcase,
  Inbox,
  FileText,
  Users,
  SatelliteDish,
  GraduationCap,
} from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import type { Role } from "@/lib/auth/roles";
import { getStarlinkClientById } from "@/lib/db/starlink";
import { getAcademyEnrollmentById } from "@/lib/db/academy";
import ThemeToggle from "@/app/admin/_components/ThemeToggle";
import MobileNav from "@/app/admin/_components/MobileNav";
import AdminNavLink from "@/app/admin/_components/AdminNavLink";
import LogoutButton from "@/app/admin/_components/LogoutButton";
import { NavProgressProvider } from "@/app/admin/_components/NavProgressContext";
import AdminProgressBar from "@/app/admin/_components/AdminProgressBar";
import { ToastProvider } from "@/components/ui/toast";
import "../globals.css";

const THEME_COOKIE_NAME = "cp_admin_theme";

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
  { href: "/admin/cms", label: "CMS", icon: FileStack, roles: ["super_admin", "content_editor"] },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, roles: ["super_admin", "hr_recruiter"] },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox, roles: ["super_admin"] },
  {
    href: "/admin/applications",
    label: "Applications",
    icon: FileText,
    roles: ["super_admin", "hr_recruiter"],
  },
  { href: "/admin/users", label: "Users", icon: Users, roles: ["super_admin"] },
  {
    href: "/admin/starlink",
    label: "Starlink Management",
    icon: SatelliteDish,
    roles: ["super_admin"],
  },
  {
    href: "/admin/academy",
    label: "Cyber PolCo Academy",
    icon: GraduationCap,
    roles: ["super_admin"],
  },
];

const ROLE_BADGES: Record<Exclude<Role, "viewer">, string> = {
  super_admin: "Admin",
  hr_recruiter: "HR",
  content_editor: "Publisher",
};

async function getRoleBadge(
  session: Awaited<ReturnType<typeof getSession>>
): Promise<string> {
  if (!session) return "Admin";
  if (session.role !== "viewer") return ROLE_BADGES[session.role];

  if (session.viewerType === "starlink_client" && session.linkedId) {
    const client = await getStarlinkClientById(session.linkedId);
    return client?.clientId ?? "Viewer";
  }
  if (session.viewerType === "academy_student" && session.linkedId) {
    const enrollment = await getAcademyEnrollmentById(session.linkedId);
    return enrollment?.studentId ?? "Student";
  }
  return "Viewer";
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const showChrome = Boolean(session) && !session?.mustChangePassword;
  const visibleNavItems = session
    ? navItems.filter((item) => item.roles.includes(session.role))
    : [];
  const roleBadge = await getRoleBadge(session);

  const cookieStore = await cookies();
  const isDark = cookieStore.get(THEME_COOKIE_NAME)?.value === "dark";

  return (
    <html lang="en" className={isDark ? "dark" : undefined}>
      <body className="min-h-screen bg-brand-dark-2/5 font-sans text-brand-dark antialiased dark:bg-brand-dark dark:text-white">
        <ToastProvider>
          {showChrome ? (
            <NavProgressProvider>
              <AdminProgressBar />
              <div className="flex min-h-screen flex-col md:flex-row">
                <MobileNav
                  navItems={visibleNavItems.map((item) => ({
                    href: item.href,
                    label: item.label,
                    icon: <item.icon size={18} />,
                  }))}
                  roleBadge={roleBadge}
                  isDark={isDark}
                />
                <aside className="hidden w-60 flex-col border-r border-black/5 bg-white p-5 dark:border-white/10 dark:bg-brand-dark-2 md:flex">
                  <div className="mb-8 font-display text-lg font-bold text-brand-dark dark:text-white">
                    Cyber PolCo <span className="text-brand-red">{roleBadge}</span>
                  </div>
                  <nav className="flex-1 space-y-1">
                    {visibleNavItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <AdminNavLink
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-gray hover:bg-brand-blue/10 hover:text-brand-blue dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                        >
                          <Icon size={18} />
                          {item.label}
                        </AdminNavLink>
                      );
                    })}
                  </nav>
                  <ThemeToggle initialTheme={isDark ? "dark" : "light"} />
                  <form action="/api/admin/logout" method="POST">
                    <LogoutButton />
                  </form>
                </aside>
                <main className="flex-1 p-6 md:p-10">{children}</main>
              </div>
            </NavProgressProvider>
          ) : (
            children
          )}
        </ToastProvider>
      </body>
    </html>
  );
}

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
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  UserCircle,
  History,
  Gauge,
  LifeBuoy,
  Phone,
  Mail,
  Wallet,
} from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import { logoutAction } from "@/lib/actions/auth";
import type { Role } from "@/lib/auth/roles";
import type { ViewerType } from "@/lib/db/users";
import { getStarlinkClientById, getOpenHelpRequestsCount } from "@/lib/db/starlink";
import { getAcademyEnrollmentById } from "@/lib/db/academy";
import { getUnreadInquiriesCount } from "@/lib/db/inquiries";
import { getPendingChangesCount } from "@/lib/db/pending-changes";
import { getUserById } from "@/lib/db/users";
import ThemeToggle from "@/app/admin/_components/ThemeToggle";
import MobileNav from "@/app/admin/_components/MobileNav";
import AdminNavLink from "@/app/admin/_components/AdminNavLink";
import LogoutButton from "@/app/admin/_components/LogoutButton";
import { NavProgressProvider } from "@/app/admin/_components/NavProgressContext";
import AdminProgressBar from "@/app/admin/_components/AdminProgressBar";
import { ToastProvider } from "@/components/ui/toast";
import { APP_VERSION } from "@/lib/version";
import "../globals.css";

const THEME_COOKIE_NAME = "cp_admin_theme";

export const metadata: Metadata = {
  title: "Cyber PolCo — Admin",
  robots: { index: false, follow: false },
};

const navItems: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
  // When set, further restricts a "viewer" role entry to a specific
  // viewerType — e.g. the academy_student self-service pages shouldn't show
  // up for starlink_client viewers.
  viewerTypes?: ViewerType[];
}[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "content_editor", "hr_recruiter", "technician", "teacher", "viewer"],
  },
  {
    href: "/admin/financial-transactions",
    label: "Financial Transactions",
    icon: Wallet,
    roles: ["super_admin", "technician", "teacher"],
  },
  { href: "/admin/articles", label: "Articles", icon: Newspaper, roles: ["super_admin", "content_editor"] },
  { href: "/admin/cms", label: "CMS", icon: FileStack, roles: ["super_admin", "content_editor"] },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase, roles: ["super_admin", "hr_recruiter"] },
  {
    href: "/admin/inquiries",
    label: "Inquiries",
    icon: Inbox,
    roles: ["super_admin", "hr_recruiter", "technician", "teacher"],
  },
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
    roles: ["super_admin", "technician"],
  },
  {
    href: "/admin/starlink/my-info",
    label: "My Info",
    icon: UserCircle,
    roles: ["viewer"],
    viewerTypes: ["starlink_client"],
  },
  {
    href: "/admin/starlink/speed-test",
    label: "Speed Test",
    icon: Gauge,
    roles: ["viewer"],
    viewerTypes: ["starlink_client"],
  },
  {
    href: "/admin/starlink/get-help",
    label: "Get Help",
    icon: LifeBuoy,
    roles: ["viewer"],
    viewerTypes: ["starlink_client"],
  },
  {
    href: "/admin/academy",
    label: "Cyber PolCo Academy",
    icon: GraduationCap,
    roles: ["super_admin", "teacher"],
  },
  {
    href: "/admin/academy/my-courses",
    label: "My Courses",
    icon: BookOpen,
    roles: ["viewer"],
    viewerTypes: ["academy_student"],
  },
  {
    href: "/admin/academy/progress",
    label: "Progress Report",
    icon: TrendingUp,
    roles: ["viewer"],
    viewerTypes: ["academy_student"],
  },
  {
    href: "/admin/academy/profile",
    label: "My Information",
    icon: UserCircle,
    roles: ["viewer"],
    viewerTypes: ["academy_student"],
  },
  {
    href: "/admin/pending-changes",
    label: "Pending changes",
    icon: ClipboardCheck,
    roles: ["super_admin"],
  },
  {
    href: "/admin/templates",
    label: "Templates",
    icon: Mail,
    roles: ["super_admin", "hr_recruiter"],
  },
  {
    href: "/admin/my-submissions",
    label: "My Submissions",
    icon: History,
    roles: ["content_editor", "technician", "teacher", "hr_recruiter"],
  },
  {
    href: "/admin/my-phone",
    label: "My Phone",
    icon: Phone,
    roles: ["technician"],
  },
];

const ROLE_BADGES: Record<Exclude<Role, "viewer">, string> = {
  super_admin: "Admin",
  hr_recruiter: "HR",
  content_editor: "Publisher",
  technician: "Technician",
  teacher: "Teacher",
};

async function getRoleBadge(
  session: Awaited<ReturnType<typeof getSession>>
): Promise<string> {
  if (!session) return "Admin";

  if (session.role !== "viewer") {
    const user = await getUserById(session.userId);
    return user?.name || ROLE_BADGES[session.role];
  }

  if (session.viewerType === "starlink_client" && session.linkedId) {
    const client = await getStarlinkClientById(session.linkedId);
    return client?.clientId ?? "Client";
  }
  if (session.viewerType === "academy_student" && session.linkedId) {
    const enrollment = await getAcademyEnrollmentById(session.linkedId);
    return enrollment?.studentId ?? "Student";
  }
  return "Student/Client";
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  const showChrome = Boolean(session) && !session?.mustChangePassword;
  const visibleNavItems = session
    ? navItems.filter(
        (item) =>
          item.roles.includes(session.role) &&
          (!item.viewerTypes || (session.viewerType && item.viewerTypes.includes(session.viewerType)))
      )
    : [];
  const roleBadge = await getRoleBadge(session);

  // Only queried for roles that can see Inquiries at all, to avoid an
  // unnecessary DB round-trip for everyone else.
  const canSeeInquiries =
    session?.role === "super_admin" ||
    session?.role === "hr_recruiter" ||
    session?.role === "technician" ||
    session?.role === "teacher";
  const unreadInquiriesCount = canSeeInquiries ? await getUnreadInquiriesCount() : 0;

  // Only super_admin has a "Pending changes" nav item at all — see navItems.
  const pendingChangesCount =
    session?.role === "super_admin" ? await getPendingChangesCount("pending") : 0;

  // Only super_admin/technician manage Starlink clients at all.
  const canSeeStarlink = session?.role === "super_admin" || session?.role === "technician";
  const openHelpRequestCount = canSeeStarlink ? await getOpenHelpRequestsCount() : 0;

  const BADGE_COUNTS_BY_HREF: Record<string, number> = {
    "/admin/inquiries": unreadInquiriesCount,
    "/admin/pending-changes": pendingChangesCount,
    "/admin/starlink": openHelpRequestCount,
  };
  const navItemsWithBadges = visibleNavItems.map((item) => {
    const count = BADGE_COUNTS_BY_HREF[item.href];
    return { ...item, badge: count > 0 ? count : undefined };
  });

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
                  navItems={navItemsWithBadges.map((item) => ({
                    href: item.href,
                    label: item.label,
                    icon: <item.icon size={18} />,
                    badge: item.badge,
                  }))}
                  roleBadge={roleBadge}
                  isDark={isDark}
                />
                <aside className="hidden w-60 flex-col border-r border-black/5 bg-white p-5 dark:border-white/10 dark:bg-brand-dark-2 md:flex">
                  <div className="mb-8 font-display text-lg font-bold text-brand-dark dark:text-white">
                    Cyber PolCo <span className="text-brand-red">{roleBadge}</span>
                  </div>
                  <nav className="flex-1 space-y-1">
                    {navItemsWithBadges.map((item) => {
                      const Icon = item.icon;
                      return (
                        <AdminNavLink
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-gray hover:bg-brand-blue/10 hover:text-brand-blue aria-[current=page]:bg-brand-blue/10 aria-[current=page]:font-semibold aria-[current=page]:text-brand-blue dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white dark:aria-[current=page]:bg-white/10 dark:aria-[current=page]:text-white"
                        >
                          <Icon size={18} />
                          {item.label}
                          {item.badge !== undefined && (
                            <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-red px-1.5 text-xs font-semibold text-white">
                              {item.badge}
                            </span>
                          )}
                        </AdminNavLink>
                      );
                    })}
                  </nav>
                  <p className="mb-1 text-center text-[11px] text-brand-gray/60 dark:text-white/30">v{APP_VERSION}</p>
                  <ThemeToggle initialTheme={isDark ? "dark" : "light"} />
                  <form action={logoutAction}>
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

import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Newspaper,
  Briefcase,
  Inbox,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import "../globals.css";

export const metadata: Metadata = {
  title: "Cyber PolCo — Admin",
  robots: { index: false, follow: false },
};

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/articles", label: "Articles", icon: Newspaper },
  { href: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/admin/inquiries", label: "Inquiries", icon: Inbox },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  return (
    <html lang="en">
      <body className="min-h-screen bg-brand-dark-2/5 font-sans text-brand-dark antialiased">
        {session.valid ? (
          <div className="flex min-h-screen">
            <aside className="hidden w-60 flex-col border-r border-black/5 bg-white p-5 md:flex">
              <div className="mb-8 font-display text-lg font-bold text-brand-dark">
                Cyber PolCo <span className="text-brand-red">Admin</span>
              </div>
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
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

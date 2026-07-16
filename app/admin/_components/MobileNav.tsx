"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import AdminNavLink from "./AdminNavLink";
import LogoutButton from "./LogoutButton";

type NavItem = { href: string; label: string; icon: React.ReactNode };

export default function MobileNav({
  navItems,
  roleBadge,
  isDark,
}: {
  navItems: NavItem[];
  roleBadge: string;
  isDark: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <header className="flex items-center justify-between border-b border-black/5 bg-white px-4 py-3 dark:border-white/10 dark:bg-brand-dark-2">
        <div className="font-display text-lg font-bold text-brand-dark dark:text-white">
          Cyber PolCo <span className="text-brand-red">{roleBadge}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-lg p-2 text-brand-dark hover:bg-brand-blue/10 dark:text-white"
        >
          <Menu size={22} />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="flex w-72 max-w-[80vw] flex-col overflow-y-auto bg-white p-5 dark:bg-brand-dark-2">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-brand-dark dark:text-white">
                Cyber PolCo <span className="text-brand-red">{roleBadge}</span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-lg p-2 text-brand-dark hover:bg-brand-red/10 dark:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
                <AdminNavLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-gray hover:bg-brand-blue/10 hover:text-brand-blue dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                >
                  {item.icon}
                  {item.label}
                </AdminNavLink>
              ))}
            </nav>
            <ThemeToggle initialTheme={isDark ? "dark" : "light"} />
            <form action="/api/admin/logout" method="POST">
              <LogoutButton />
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

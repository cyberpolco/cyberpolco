"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Search } from "lucide-react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { deleteUserAction } from "@/lib/actions/users";
import { ROLES, ROLE_LABELS } from "@/lib/auth/roles";
import type { User } from "@/lib/db/users";
import { formatDateTime } from "@/lib/utils/date-format";

const MAIN_EMAIL_PROVIDERS = [
  { domain: "gmail.com", label: "Gmail (@gmail.com)" },
  { domain: "yahoo.com", label: "Yahoo (@yahoo.com)" },
  { domain: "outlook.com", label: "Outlook (@outlook.com)" },
  { domain: "hotmail.com", label: "Hotmail (@hotmail.com)" },
  { domain: "icloud.com", label: "iCloud (@icloud.com)" },
  { domain: "cyberpolco.com", label: "Cyberpolco (@cyberpolco.com)" },
];

type StatusFilter = "" | "active" | "pending";
type LastLoginFilter = "" | "never" | "today" | "week" | "month" | "year";

function emailDomain(email: string): string {
  return email.slice(email.lastIndexOf("@") + 1).toLowerCase();
}

function matchesLastLogin(lastLoginAt: string | null, filter: LastLoginFilter): boolean {
  if (!filter) return true;
  if (filter === "never") return lastLoginAt === null;
  if (!lastLoginAt) return false;

  const diffMs = Date.now() - new Date(lastLoginAt).getTime();
  const DAY = 24 * 60 * 60 * 1000;
  switch (filter) {
    case "today":
      return diffMs <= DAY;
    case "week":
      return diffMs <= 7 * DAY;
    case "month":
      return diffMs <= 30 * DAY;
    case "year":
      return diffMs <= 365 * DAY;
  }
}

export default function UsersTable({ users, currentUserId }: { users: User[]; currentUserId: string }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [domain, setDomain] = useState("");
  const [lastLogin, setLastLogin] = useState<LastLoginFilter>("");

  const domainOptions = useMemo(() => {
    const known = new Set(MAIN_EMAIL_PROVIDERS.map((p) => p.domain));
    const extra = Array.from(new Set(users.map((u) => emailDomain(u.email))))
      .filter((d) => d && !known.has(d))
      .sort();
    return [...MAIN_EMAIL_PROVIDERS, ...extra.map((d) => ({ domain: d, label: `@${d}` }))];
  }, [users]);

  const q = query.trim().toLowerCase();
  const filtered = users.filter((u) => {
    if (q && !u.email.toLowerCase().includes(q)) return false;
    if (role && u.role !== role) return false;
    if (status === "active" && u.mustChangePassword) return false;
    if (status === "pending" && !u.mustChangePassword) return false;
    if (domain && emailDomain(u.email) !== domain) return false;
    if (!matchesLastLogin(u.lastLoginAt, lastLogin)) return false;
    return true;
  });

  const hasActiveFilters = q !== "" || role !== "" || status !== "" || domain !== "" || lastLogin !== "";

  function clearFilters() {
    setQuery("");
    setRole("");
    setStatus("");
    setDomain("");
    setLastLogin("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray dark:text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by email..."
            className="w-full rounded-full border border-black/10 dark:border-white/15 py-2 pl-9 pr-4 text-sm dark:bg-white/5 dark:text-white"
          />
        </div>

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 px-3 py-2 text-sm text-brand-dark dark:text-white outline-none focus:border-brand-blue"
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusFilter)}
          className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 px-3 py-2 text-sm text-brand-dark dark:text-white outline-none focus:border-brand-blue"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending first login</option>
        </select>

        <select
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 px-3 py-2 text-sm text-brand-dark dark:text-white outline-none focus:border-brand-blue"
        >
          <option value="">All email providers</option>
          {domainOptions.map((d) => (
            <option key={d.domain} value={d.domain}>
              {d.label}
            </option>
          ))}
        </select>

        <select
          value={lastLogin}
          onChange={(e) => setLastLogin(e.target.value as LastLoginFilter)}
          className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 px-3 py-2 text-sm text-brand-dark dark:text-white outline-none focus:border-brand-blue"
        >
          <option value="">Any last login</option>
          <option value="never">Never</option>
          <option value="today">Today</option>
          <option value="week">This week</option>
          <option value="month">Last month</option>
          <option value="year">Last year</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-brand-blue"
          >
            Clear filters
          </button>
        )}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Last login</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">{u.email}</td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{ROLE_LABELS[u.role]}</td>
                  <td className="px-5 py-3">
                    {u.mustChangePassword ? (
                      <span className="rounded-full bg-brand-yellow/10 px-2.5 py-1 text-xs font-semibold text-brand-yellow">
                        Pending first login
                      </span>
                    ) : (
                      <span className="rounded-full bg-brand-blue/10 px-2.5 py-1 text-xs font-semibold text-brand-blue">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                    {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/users/${u.id}/edit`} className="text-brand-blue">
                        <Pencil size={16} />
                      </Link>
                      {u.id !== currentUserId && (
                        <DeleteButton
                          action={deleteUserAction}
                          id={u.id}
                          confirmTitle="Delete this user?"
                          confirmBody={`${u.email} will lose access immediately.`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                    {users.length === 0 ? "No users yet." : "No users match these filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

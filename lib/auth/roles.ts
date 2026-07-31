export type Role =
  | "super_admin"
  | "content_editor"
  | "hr_recruiter"
  | "technician"
  | "teacher"
  | "viewer";

export const ROLES: Role[] = [
  "super_admin",
  "content_editor",
  "hr_recruiter",
  "technician",
  "teacher",
  "viewer",
];

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  content_editor: "Content Editor",
  hr_recruiter: "HR / Recruiter",
  technician: "Technician",
  teacher: "Teacher",
  viewer: "Viewer",
};

const ALL_ROLES: Role[] = ROLES;

type RouteRule = { prefix: string; roles: Role[] };

const ROUTE_RULES: RouteRule[] = [
  { prefix: "/admin/dashboard", roles: ALL_ROLES },
  { prefix: "/admin/change-password", roles: ALL_ROLES },
  { prefix: "/admin/articles", roles: ["super_admin", "content_editor"] },
  // Content, Services, Footer, and Settings all live under one CMS section.
  { prefix: "/admin/cms", roles: ["super_admin", "content_editor"] },
  { prefix: "/admin/jobs", roles: ["super_admin", "hr_recruiter"] },
  { prefix: "/admin/applications", roles: ["super_admin", "hr_recruiter"] },
  { prefix: "/admin/inquiries", roles: ["super_admin", "hr_recruiter"] },
  { prefix: "/admin/users", roles: ["super_admin"] },
  // Technician/teacher can create and edit here, but not delete or approve —
  // that finer-grained distinction is enforced in the Server Actions
  // themselves (lib/actions/starlink.ts, lib/actions/academy.ts), not here.
  { prefix: "/admin/starlink", roles: ["super_admin", "technician"] },
  { prefix: "/admin/academy", roles: ["super_admin", "teacher"] },
  { prefix: "/admin/pending-changes", roles: ["super_admin"] },
];

/**
 * Unlisted /admin/* routes default-deny — every real route above must be
 * listed explicitly rather than relying on a permissive fallback.
 */
export function isRouteAllowed(pathname: string, role: Role): boolean {
  const rule = ROUTE_RULES.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`)
  );
  if (!rule) return false;
  return rule.roles.includes(role);
}

import { describe, expect, it } from "vitest";
import { isRouteAllowed, ROLES, type Role } from "./roles";

const ALL_ROLES = ROLES;

function rolesAllowedFor(pathname: string): Role[] {
  return ALL_ROLES.filter((role) => isRouteAllowed(pathname, role));
}

describe("isRouteAllowed", () => {
  it("allows every role on shared routes", () => {
    expect(rolesAllowedFor("/admin/dashboard")).toEqual(ALL_ROLES);
    expect(rolesAllowedFor("/admin/change-password")).toEqual(ALL_ROLES);
  });

  it("restricts content routes to super_admin and content_editor", () => {
    expect(rolesAllowedFor("/admin/articles")).toEqual(["super_admin", "content_editor"]);
    expect(rolesAllowedFor("/admin/cms")).toEqual(["super_admin", "content_editor"]);
  });

  it("restricts hiring routes to super_admin and hr_recruiter", () => {
    expect(rolesAllowedFor("/admin/jobs")).toEqual(["super_admin", "hr_recruiter"]);
    expect(rolesAllowedFor("/admin/applications")).toEqual(["super_admin", "hr_recruiter"]);
  });

  it("restricts sensitive routes to super_admin only", () => {
    for (const pathname of ["/admin/inquiries", "/admin/users", "/admin/starlink", "/admin/academy"]) {
      expect(rolesAllowedFor(pathname)).toEqual(["super_admin"]);
    }
  });

  it("matches nested sub-paths under an allowed prefix", () => {
    expect(isRouteAllowed("/admin/articles/some-slug/edit", "content_editor")).toBe(true);
    expect(isRouteAllowed("/admin/users/123/edit", "super_admin")).toBe(true);
  });

  it("does NOT match a different route that merely shares a prefix", () => {
    // Regression test: pathname.startsWith(prefix) without a boundary check
    // would incorrectly let "/admin/articles-archive" inherit the
    // "/admin/articles" rule. It must require an exact match or "/" boundary.
    expect(isRouteAllowed("/admin/articles-archive", "content_editor")).toBe(false);
    expect(isRouteAllowed("/admin/usersomething", "super_admin")).toBe(false);
  });

  it("default-denies unlisted routes for every role", () => {
    for (const role of ALL_ROLES) {
      expect(isRouteAllowed("/admin/something-not-listed", role)).toBe(false);
    }
  });
});

import { describe, expect, it } from "vitest";
import { computeUsersStats, type User } from "./users";
import { ROLE_LABELS, type Role } from "@/lib/auth/roles";

function makeUser(role: Role, overrides: Partial<User> = {}): User {
  return {
    id: `user-${role}`,
    email: `${role}@example.com`,
    passwordHash: "hash",
    role,
    name: null,
    mustChangePassword: false,
    createdAt: "2026-01-01T00:00:00.000Z",
    createdBy: null,
    lastLoginAt: null,
    viewerType: null,
    linkedId: null,
    phone: null,
    phoneUpdatedAt: null,
    ...overrides,
  };
}

describe("computeUsersStats", () => {
  it("counts users per role, covering every role including the newest ones", () => {
    const stats = computeUsersStats([
      makeUser("super_admin"),
      makeUser("technician"),
      makeUser("technician", { id: "user-technician-2" }),
      makeUser("teacher"),
    ]);

    expect(stats.byRole).toEqual([
      { label: ROLE_LABELS.super_admin, value: 1 },
      { label: ROLE_LABELS.content_editor, value: 0 },
      { label: ROLE_LABELS.hr_recruiter, value: 0 },
      { label: ROLE_LABELS.technician, value: 2 },
      { label: ROLE_LABELS.teacher, value: 1 },
      { label: ROLE_LABELS.viewer, value: 0 },
    ]);
  });

  it("handles an empty list", () => {
    const stats = computeUsersStats([]);
    expect(stats.byRole.every((r) => r.value === 0)).toBe(true);
  });
});

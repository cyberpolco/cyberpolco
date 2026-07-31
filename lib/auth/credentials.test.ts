import { describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";

vi.mock("@/lib/db/users", () => ({ getUserByEmail: vi.fn() }));

const { getUserByEmail } = await import("@/lib/db/users");
const { verifyUserCredentials } = await import("./credentials");

const passwordHash = bcrypt.hashSync("correct-horse-battery-staple", 10);

const user = {
  id: "user-1",
  email: "admin@example.com",
  passwordHash,
  role: "super_admin" as const,
  mustChangePassword: false,
  createdAt: "2026-01-01T00:00:00.000Z",
  createdBy: null,
  lastLoginAt: null,
  viewerType: null,
  linkedId: null,
};

describe("verifyUserCredentials", () => {
  it("returns null for an unknown email without hashing anything", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(undefined);

    const result = await verifyUserCredentials("nobody@example.com", "whatever");

    expect(result).toBeNull();
  });

  it("returns the user when the password matches", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(user);

    const result = await verifyUserCredentials("admin@example.com", "correct-horse-battery-staple");

    expect(result).toEqual(user);
  });

  it("returns null when the password doesn't match", async () => {
    vi.mocked(getUserByEmail).mockResolvedValue(user);

    const result = await verifyUserCredentials("admin@example.com", "wrong-password");

    expect(result).toBeNull();
  });
});

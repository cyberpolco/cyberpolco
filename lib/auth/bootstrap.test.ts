import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/db/users", () => ({ countUsers: vi.fn(), saveUser: vi.fn() }));

const { countUsers, saveUser } = await import("@/lib/db/users");
const { ensureBootstrapSuperAdmin } = await import("./bootstrap");

const originalEmail = process.env.ADMIN_EMAIL;
const originalPasswordHash = process.env.ADMIN_PASSWORD_HASH;

describe("ensureBootstrapSuperAdmin", () => {
  beforeEach(() => {
    process.env.ADMIN_EMAIL = "admin@example.com";
    process.env.ADMIN_PASSWORD_HASH = "hashed-password";
  });

  afterEach(() => {
    process.env.ADMIN_EMAIL = originalEmail;
    process.env.ADMIN_PASSWORD_HASH = originalPasswordHash;
  });

  it("does nothing when users already exist", async () => {
    vi.mocked(countUsers).mockResolvedValue(1);

    await ensureBootstrapSuperAdmin();

    expect(saveUser).not.toHaveBeenCalled();
  });

  it("does nothing when the table is empty but bootstrap env vars are unset", async () => {
    vi.mocked(countUsers).mockResolvedValue(0);
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD_HASH;

    await ensureBootstrapSuperAdmin();

    expect(saveUser).not.toHaveBeenCalled();
  });

  it("creates the first super admin from env vars when the table is empty", async () => {
    vi.mocked(countUsers).mockResolvedValue(0);

    await ensureBootstrapSuperAdmin();

    expect(saveUser).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "admin@example.com",
        passwordHash: "hashed-password",
        role: "super_admin",
        mustChangePassword: false,
      })
    );
  });

  it("doesn't propagate when saveUser fails (a concurrent bootstrap race)", async () => {
    vi.mocked(countUsers).mockResolvedValue(0);
    vi.mocked(saveUser).mockRejectedValue(new Error("duplicate key"));

    await expect(ensureBootstrapSuperAdmin()).resolves.toBeUndefined();
  });
});

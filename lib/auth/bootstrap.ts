import crypto from "crypto";
import { countUsers, saveUser } from "@/lib/db/users";

/**
 * Creates the first Super Admin from ADMIN_EMAIL/ADMIN_PASSWORD_HASH the
 * moment the users table is empty, so migrating from the old env-var-only
 * admin to the DB-backed users table can never lock everyone out — the
 * existing credentials just keep working on the next login attempt.
 *
 * After this fires once, ADMIN_EMAIL/ADMIN_PASSWORD_HASH become inert —
 * all real auth reads from the users table from then on.
 */
export async function ensureBootstrapSuperAdmin(): Promise<void> {
  const existingCount = await countUsers();
  if (existingCount > 0) return;

  const email = process.env.ADMIN_EMAIL;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!email || !passwordHash) return;

  try {
    await saveUser({
      id: crypto.randomUUID(),
      email,
      passwordHash,
      role: "super_admin",
      mustChangePassword: false,
      createdAt: new Date().toISOString(),
      createdBy: null,
      lastLoginAt: null,
      viewerType: null,
      linkedId: null,
    });
  } catch {
    // Another concurrent request already bootstrapped the table — fine.
  }
}

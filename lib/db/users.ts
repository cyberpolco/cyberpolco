import { eq } from "drizzle-orm";
import { db } from "./client";
import { users as usersTable } from "./schema";

export type Role = "super_admin" | "content_editor" | "hr_recruiter" | "viewer";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  mustChangePassword: boolean;
  createdAt: string;
  createdBy: string | null;
  lastLoginAt: string | null;
};

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function getUsers(): Promise<User[]> {
  return db.select().from(usersTable);
}

export async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id));
  return user;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, normalizeEmail(email)));
  return user;
}

export async function countUsers(): Promise<number> {
  const rows = await db.select({ id: usersTable.id }).from(usersTable);
  return rows.length;
}

export async function countSuperAdmins(): Promise<number> {
  const rows = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(eq(usersTable.role, "super_admin"));
  return rows.length;
}

export async function saveUser(user: User): Promise<void> {
  const normalized = { ...user, email: normalizeEmail(user.email) };
  await db
    .insert(usersTable)
    .values(normalized)
    .onConflictDoUpdate({ target: usersTable.id, set: normalized });
}

export async function deleteUser(id: string): Promise<void> {
  await db.delete(usersTable).where(eq(usersTable.id, id));
}

export async function updateUserPassword(
  id: string,
  passwordHash: string,
  mustChangePassword: boolean
): Promise<void> {
  await db
    .update(usersTable)
    .set({ passwordHash, mustChangePassword })
    .where(eq(usersTable.id, id));
}

export async function touchLastLogin(id: string): Promise<void> {
  await db
    .update(usersTable)
    .set({ lastLoginAt: new Date().toISOString() })
    .where(eq(usersTable.id, id));
}

import { and, eq } from "drizzle-orm";
import { db } from "./client";
import { users as usersTable } from "./schema";
import { ROLES, ROLE_LABELS, type Role } from "@/lib/auth/roles";

export type { Role };
export type ViewerType = "starlink_client" | "academy_student";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  name: string | null;
  mustChangePassword: boolean;
  createdAt: string;
  createdBy: string | null;
  lastLoginAt: string | null;
  viewerType: ViewerType | null;
  linkedId: string | null;
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

// Resolves a viewer account by the internal id of its linked academy
// enrollment or Starlink client row — not the human-readable Student/Client
// ID, which callers must resolve to that internal id first.
export async function getUserByLinkedId(viewerType: ViewerType, linkedId: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(and(eq(usersTable.viewerType, viewerType), eq(usersTable.linkedId, linkedId)));
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

export type UsersStats = {
  byRole: { label: string; value: number }[];
};

export function computeUsersStats(users: User[]): UsersStats {
  return {
    byRole: ROLES.map((role) => ({
      label: ROLE_LABELS[role],
      value: users.filter((u) => u.role === role).length,
    })),
  };
}

export async function getUsersStats(): Promise<UsersStats> {
  return computeUsersStats(await getUsers());
}

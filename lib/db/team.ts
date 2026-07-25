import { eq, asc } from "drizzle-orm";
import { db } from "./client";
import { teamMembers as teamMembersTable } from "./schema";

export type TeamMember = typeof teamMembersTable.$inferSelect;

export async function getTeamMembers(): Promise<TeamMember[]> {
  return db.select().from(teamMembersTable).orderBy(asc(teamMembersTable.displayOrder));
}

export async function getTeamMemberById(id: string): Promise<TeamMember | undefined> {
  const [row] = await db.select().from(teamMembersTable).where(eq(teamMembersTable.id, id));
  return row;
}

export async function saveTeamMember(member: TeamMember): Promise<void> {
  await db
    .insert(teamMembersTable)
    .values(member)
    .onConflictDoUpdate({ target: teamMembersTable.id, set: member });
}

export async function deleteTeamMember(id: string): Promise<void> {
  await db.delete(teamMembersTable).where(eq(teamMembersTable.id, id));
}

export async function getNextTeamDisplayOrder(): Promise<number> {
  const rows = await db.select().from(teamMembersTable);
  return rows.length;
}

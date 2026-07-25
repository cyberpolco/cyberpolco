import { eq } from "drizzle-orm";
import { db } from "./client";
import { achievements as achievementsTable } from "./schema";

export type Achievement = typeof achievementsTable.$inferSelect;

export async function getAchievements(): Promise<Achievement[]> {
  return db.select().from(achievementsTable);
}

// Ascending — oldest/creation first, so the timeline reads top (past) to
// bottom (present). Same-date collisions tiebreak on id for a stable order.
export async function getSortedAchievements(): Promise<Achievement[]> {
  const items = await getAchievements();
  return [...items].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.id < b.id ? -1 : 1;
  });
}

export async function getAchievementById(id: string): Promise<Achievement | undefined> {
  const [row] = await db.select().from(achievementsTable).where(eq(achievementsTable.id, id));
  return row;
}

export async function saveAchievement(achievement: Achievement): Promise<void> {
  await db
    .insert(achievementsTable)
    .values(achievement)
    .onConflictDoUpdate({ target: achievementsTable.id, set: achievement });
}

export async function deleteAchievement(id: string): Promise<void> {
  await db.delete(achievementsTable).where(eq(achievementsTable.id, id));
}

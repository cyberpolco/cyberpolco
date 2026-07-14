import { eq } from "drizzle-orm";
import { db } from "./client";
import { contentBlocks as contentBlocksTable } from "./schema";

export type Localized<T> = { fr: T; en: T };

export async function getContentBlock<T>(key: string): Promise<Localized<T> | undefined> {
  const [row] = await db
    .select()
    .from(contentBlocksTable)
    .where(eq(contentBlocksTable.key, key));
  if (!row) return undefined;
  return { fr: row.fr as T, en: row.en as T };
}

export async function getAllContentBlocks(): Promise<Record<string, Localized<unknown>>> {
  const rows = await db.select().from(contentBlocksTable);
  const result: Record<string, Localized<unknown>> = {};
  for (const row of rows) {
    result[row.key] = { fr: row.fr, en: row.en };
  }
  return result;
}

export async function saveContentBlock<T>(key: string, value: Localized<T>): Promise<void> {
  const updatedAt = new Date().toISOString();
  await db
    .insert(contentBlocksTable)
    .values({ key, fr: value.fr, en: value.en, updatedAt })
    .onConflictDoUpdate({
      target: contentBlocksTable.key,
      set: { fr: value.fr, en: value.en, updatedAt },
    });
}

import { db } from "./client";
import { settings as settingsTable } from "./schema";
import { stats as defaultStats, socialLinks as defaultSocial } from "@/lib/content/company";

export type SiteSettings = {
  stats: typeof defaultStats;
  socialLinks: typeof defaultSocial;
};

const SINGLETON_ID = "singleton";

const defaults: SiteSettings = {
  stats: defaultStats,
  socialLinks: defaultSocial,
};

export async function getSettings(): Promise<SiteSettings> {
  const [row] = await db.select().from(settingsTable);
  if (!row) return defaults;
  return { stats: row.stats, socialLinks: row.socialLinks };
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await db
    .insert(settingsTable)
    .values({ id: SINGLETON_ID, ...settings })
    .onConflictDoUpdate({ target: settingsTable.id, set: settings });
}

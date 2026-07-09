import { store } from "./store";
import { stats as defaultStats, socialLinks as defaultSocial } from "@/lib/content/company";

export type SiteSettings = {
  stats: typeof defaultStats;
  socialLinks: typeof defaultSocial;
};

const COLLECTION = "settings";

const defaults: SiteSettings = {
  stats: defaultStats,
  socialLinks: defaultSocial,
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await store.readAll<SiteSettings>(COLLECTION, [defaults]);
  return rows[0] || defaults;
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await store.writeAll(COLLECTION, [settings]);
}

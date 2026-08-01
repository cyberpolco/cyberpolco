import { db } from "./client";
import { settings as settingsTable } from "./schema";
import {
  stats as defaultStats,
  socialLinks as defaultSocial,
  offices as defaultOffices,
} from "@/lib/content/company";
import { SUBSCRIPTION_PRICING_DEFAULTS_CENTS, type SubscriptionPricingCents } from "@/lib/content/starlink-options";

export type SiteSettings = {
  stats: typeof defaultStats;
  socialLinks: typeof defaultSocial;
  offices: typeof defaultOffices;
  starlinkPricing: SubscriptionPricingCents;
};

const SINGLETON_ID = "singleton";

const defaults: SiteSettings = {
  stats: defaultStats,
  socialLinks: defaultSocial,
  offices: defaultOffices,
  starlinkPricing: SUBSCRIPTION_PRICING_DEFAULTS_CENTS,
};

export async function getSettings(): Promise<SiteSettings> {
  const [row] = await db.select().from(settingsTable);
  if (!row) return defaults;
  return {
    stats: row.stats,
    socialLinks: row.socialLinks,
    offices: row.offices ?? defaultOffices,
    starlinkPricing: row.starlinkPricing ?? SUBSCRIPTION_PRICING_DEFAULTS_CENTS,
  };
}

export async function saveSettings(settings: SiteSettings): Promise<void> {
  await db
    .insert(settingsTable)
    .values({ id: SINGLETON_ID, ...settings })
    .onConflictDoUpdate({ target: settingsTable.id, set: settings });
}

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "./client";
import { contentBlocks as contentBlocksTable } from "./schema";
import { getSettings, saveSettings, type SiteSettings } from "./settings";

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

// A single admin content page (home/about/services/careers/contact/footer)
// can touch several content_blocks plus the settings singleton (stats,
// offices) in one submission. Bundling them lets that whole submission be
// queued as one pending change (lib/actions/content.ts) and applied as one
// unit on approval (lib/actions/pending-changes.ts) — including which paths
// to revalidate, since that differs per page and only matters once applied.
export type ContentBundle = {
  blocks: Record<string, Localized<unknown>>;
  stats?: SiteSettings["stats"];
  offices?: SiteSettings["offices"];
  revalidate: { path: string; type?: "page" | "layout" }[];
};

export async function applyContentBundle(bundle: ContentBundle): Promise<void> {
  for (const [key, value] of Object.entries(bundle.blocks)) {
    await saveContentBlock(key, value);
  }

  if (bundle.stats || bundle.offices) {
    const current = await getSettings();
    await saveSettings({
      ...current,
      ...(bundle.stats ? { stats: bundle.stats } : {}),
      ...(bundle.offices ? { offices: bundle.offices } : {}),
    });
  }

  for (const r of bundle.revalidate) {
    revalidatePath(r.path, r.type);
  }
}

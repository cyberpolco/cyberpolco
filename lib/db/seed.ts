import { db } from "./client";
import {
  articles as articlesTable,
  settings as settingsTable,
  contentBlocks as contentBlocksTable,
  services as servicesTable,
} from "./schema";
import { articles as seedArticles } from "@/lib/content/articles";
import { stats, socialLinks } from "@/lib/content/company";
import { blockDefaults } from "@/lib/content/blocks";
import { services as seedServices } from "@/lib/content/services";

async function seed() {
  await db.insert(articlesTable).values(seedArticles).onConflictDoNothing();
  await db
    .insert(settingsTable)
    .values({ id: "singleton", stats, socialLinks })
    .onConflictDoNothing();

  const now = new Date().toISOString();
  const contentBlockRows = Object.entries(blockDefaults).map(([key, value]) => ({
    key,
    fr: value.fr,
    en: value.en,
    updatedAt: now,
  }));
  await db.insert(contentBlocksTable).values(contentBlockRows).onConflictDoNothing();

  const serviceRows = seedServices.map((s, i) => ({
    slug: s.slug,
    icon: s.icon,
    displayOrder: i,
    fr: s.fr,
    en: s.en,
  }));
  await db.insert(servicesTable).values(serviceRows).onConflictDoNothing();

  console.log(
    `Seeded ${seedArticles.length} articles, default settings, ${contentBlockRows.length} content blocks, and ${serviceRows.length} services.`
  );
}

seed().then(() => process.exit(0));

import { db } from "./client";
import { articles as articlesTable, settings as settingsTable } from "./schema";
import { articles as seedArticles } from "@/lib/content/articles";
import { stats, socialLinks } from "@/lib/content/company";

async function seed() {
  await db.insert(articlesTable).values(seedArticles).onConflictDoNothing();
  await db
    .insert(settingsTable)
    .values({ id: "singleton", stats, socialLinks })
    .onConflictDoNothing();
  console.log(`Seeded ${seedArticles.length} articles and default settings.`);
}

seed().then(() => process.exit(0));

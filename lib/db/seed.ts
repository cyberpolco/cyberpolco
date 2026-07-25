import crypto from "crypto";
import { db } from "./client";
import {
  articles as articlesTable,
  settings as settingsTable,
  contentBlocks as contentBlocksTable,
  services as servicesTable,
  teamMembers as teamMembersTable,
  achievements as achievementsTable,
} from "./schema";
import { articles as seedArticles } from "@/lib/content/articles";
import { stats, socialLinks, offices } from "@/lib/content/company";
import { blockDefaults } from "@/lib/content/blocks";
import { services as seedServices } from "@/lib/content/services";

async function seed() {
  await db.insert(articlesTable).values(seedArticles).onConflictDoNothing();
  await db
    .insert(settingsTable)
    .values({ id: "singleton", stats, socialLinks, offices })
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

  const teamMemberRows = Array.from({ length: 6 }, (_, i) => ({
    id: crypto.randomUUID(),
    name: "TBD",
    photo: null,
    displayOrder: i,
    fr: { title: "Poste à définir", bio: "Description à venir." },
    en: { title: "Title TBD", bio: "Bio coming soon." },
  }));
  await db.insert(teamMembersTable).values(teamMemberRows).onConflictDoNothing();

  const achievementRows = Array.from({ length: 5 }, (_, i) => ({
    id: crypto.randomUUID(),
    date: `${2021 + i}-01-01`,
    image1: "/images/logo-mark.png",
    image2: null,
    fr: { title: "Étape à définir", description: "Description à venir." },
    en: { title: "Milestone TBD", description: "Description coming soon." },
  }));
  await db.insert(achievementsTable).values(achievementRows).onConflictDoNothing();

  console.log(
    `Seeded ${seedArticles.length} articles, default settings, ${contentBlockRows.length} content blocks, ${serviceRows.length} services, ${teamMemberRows.length} team members, and ${achievementRows.length} achievements.`
  );
}

seed().then(() => process.exit(0));

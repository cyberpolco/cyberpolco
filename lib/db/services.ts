import { eq, asc } from "drizzle-orm";
import { db } from "./client";
import { services as servicesTable } from "./schema";
import { services as staticServices, type Service } from "@/lib/content/services";

export type { Service };

// Merges DB rows with the static seed array (for any slug not yet in the
// DB) rather than an all-or-nothing fallback — so creating one new service
// before db:seed has run can't make the other, not-yet-seeded services
// disappear from the public site.
export async function getServices(): Promise<Service[]> {
  const rows = await db.select().from(servicesTable).orderBy(asc(servicesTable.displayOrder));
  const dbSlugs = new Set(rows.map((r) => r.slug));
  const missing = staticServices.filter((s) => !dbSlugs.has(s.slug));
  return [...rows, ...missing].sort(
    (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
  );
}

export async function getServiceBySlug(slug: string): Promise<Service | undefined> {
  const [row] = await db.select().from(servicesTable).where(eq(servicesTable.slug, slug));
  return row ?? staticServices.find((s) => s.slug === slug);
}

export async function saveService(service: Service & { displayOrder: number }): Promise<void> {
  await db
    .insert(servicesTable)
    .values(service)
    .onConflictDoUpdate({ target: servicesTable.slug, set: service });
}

export async function deleteService(slug: string): Promise<void> {
  await db.delete(servicesTable).where(eq(servicesTable.slug, slug));
}

export async function getNextDisplayOrder(): Promise<number> {
  const rows = await db.select().from(servicesTable);
  return rows.length;
}

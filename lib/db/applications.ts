import { db } from "./client";
import { applications as applicationsTable } from "./schema";

export type Application = {
  id: string;
  jobSlug: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  cvFileName: string;
  cvUrl: string;
  createdAt: string;
};

export async function getApplications(): Promise<Application[]> {
  const items = await db.select().from(applicationsTable);
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addApplication(
  application: Omit<Application, "id" | "createdAt">
): Promise<Application> {
  const [record] = await db
    .insert(applicationsTable)
    .values({
      ...application,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    })
    .returning();
  return record;
}

import { eq } from "drizzle-orm";
import { db } from "./client";
import { jobs as jobsTable } from "./schema";

export type Job = {
  id: string;
  slug: string;
  status: "open" | "closed";
  fr: { title: string; location: string; type: string; description: string };
  en: { title: string; location: string; type: string; description: string };
  createdAt: string;
};

export async function getJobs(): Promise<Job[]> {
  return db.select().from(jobsTable);
}

export async function getOpenJobs(): Promise<Job[]> {
  return db.select().from(jobsTable).where(eq(jobsTable.status, "open"));
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.slug, slug));
  return job;
}

export async function saveJob(job: Job): Promise<void> {
  await db.insert(jobsTable).values(job).onConflictDoUpdate({ target: jobsTable.id, set: job });
}

export async function deleteJob(id: string): Promise<void> {
  await db.delete(jobsTable).where(eq(jobsTable.id, id));
}

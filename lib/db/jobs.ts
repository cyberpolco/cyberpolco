import { eq } from "drizzle-orm";
import { db } from "./client";
import { jobs as jobsTable } from "./schema";
import type { TextAlign } from "@/lib/types/text-align";

export type Job = {
  id: string;
  slug: string;
  status: "open" | "closed";
  fr: { title: string; location: string; type: string; description: string; descriptionAlign?: TextAlign };
  en: { title: string; location: string; type: string; description: string; descriptionAlign?: TextAlign };
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

export type JobsStats = {
  byStatus: { label: string; value: number }[];
};

export function computeJobsStats(jobs: Job[]): JobsStats {
  return {
    byStatus: [
      { label: "Open", value: jobs.filter((j) => j.status === "open").length },
      { label: "Closed", value: jobs.filter((j) => j.status === "closed").length },
    ],
  };
}

export async function getJobsStats(): Promise<JobsStats> {
  return computeJobsStats(await getJobs());
}

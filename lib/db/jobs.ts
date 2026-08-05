import { eq } from "drizzle-orm";
import { db } from "./client";
import { jobs as jobsTable } from "./schema";
import type { TextAlign } from "@/lib/types/text-align";

export { toDatetimeLocalValue, fromDatetimeLocalValue } from "@/lib/jobs/jobs";

export type JobStatus = "open" | "closed" | "draft";
export type EffectiveJobStatus = "draft" | "scheduled" | "open" | "closed";

export type Job = {
  id: string;
  slug: string;
  status: JobStatus;
  openAt: string | null;
  closeAt: string | null;
  fr: { title: string; location: string; type: string; description: string; descriptionAlign?: TextAlign };
  en: { title: string; location: string; type: string; description: string; descriptionAlign?: TextAlign };
  createdAt: string;
};

// "draft"/"closed" always win. An "open" posting is further gated by
// openAt/closeAt so it can auto-start and/or auto-end without the admin
// coming back to flip status manually.
export function getEffectiveJobStatus(
  job: Pick<Job, "status" | "openAt" | "closeAt">,
  now: Date = new Date()
): EffectiveJobStatus {
  if (job.status !== "open") return job.status;
  if (job.openAt && now < new Date(job.openAt)) return "scheduled";
  if (job.closeAt && now >= new Date(job.closeAt)) return "closed";
  return "open";
}

export async function getJobs(): Promise<Job[]> {
  return db.select().from(jobsTable);
}

// Rows past their closeAt or not yet past their openAt are stored as
// status "open" (no manual flip needed) but aren't effectively open — see
// getEffectiveJobStatus.
export async function getOpenJobs(): Promise<Job[]> {
  const rows = await db.select().from(jobsTable).where(eq(jobsTable.status, "open"));
  return rows.filter((job) => getEffectiveJobStatus(job) === "open");
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

export function computeJobsStats(jobs: Job[], now: Date = new Date()): JobsStats {
  const statuses = jobs.map((j) => getEffectiveJobStatus(j, now));
  return {
    byStatus: [
      { label: "Open", value: statuses.filter((s) => s === "open").length },
      { label: "Scheduled", value: statuses.filter((s) => s === "scheduled").length },
      { label: "Closed", value: statuses.filter((s) => s === "closed").length },
      { label: "Draft", value: statuses.filter((s) => s === "draft").length },
    ],
  };
}

export async function getJobsStats(): Promise<JobsStats> {
  return computeJobsStats(await getJobs());
}

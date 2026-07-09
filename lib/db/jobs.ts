import { store } from "./store";

export type Job = {
  id: string;
  slug: string;
  status: "open" | "closed";
  fr: { title: string; location: string; type: string; description: string };
  en: { title: string; location: string; type: string; description: string };
  createdAt: string;
};

const COLLECTION = "jobs";

export async function getJobs(): Promise<Job[]> {
  return store.readAll<Job>(COLLECTION, []);
}

export async function getOpenJobs(): Promise<Job[]> {
  const jobs = await getJobs();
  return jobs.filter((j) => j.status === "open");
}

export async function getJobBySlug(slug: string): Promise<Job | undefined> {
  const jobs = await getJobs();
  return jobs.find((j) => j.slug === slug);
}

export async function saveJob(job: Job): Promise<void> {
  const jobs = await getJobs();
  const idx = jobs.findIndex((j) => j.id === job.id);
  if (idx >= 0) jobs[idx] = job;
  else jobs.push(job);
  await store.writeAll(COLLECTION, jobs);
}

export async function deleteJob(id: string): Promise<void> {
  const jobs = await getJobs();
  await store.writeAll(
    COLLECTION,
    jobs.filter((j) => j.id !== id)
  );
}

import { eq } from "drizzle-orm";
import { db } from "./client";
import { applications as applicationsTable } from "./schema";

export type Stage = "new" | "reviewing" | "interview" | "offer" | "hired" | "rejected";

export const STAGES: { value: Stage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

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
  stage: Stage;
  notes: string | null;
};

export async function getApplications(): Promise<Application[]> {
  const items = await db.select().from(applicationsTable);
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getApplicationById(id: string): Promise<Application | undefined> {
  const [record] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, id));
  return record;
}

export async function addApplication(
  application: Omit<Application, "id" | "createdAt" | "stage" | "notes">
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

export async function updateApplicationStage(id: string, stage: Stage): Promise<Application> {
  const [record] = await db
    .update(applicationsTable)
    .set({ stage })
    .where(eq(applicationsTable.id, id))
    .returning();
  return record;
}

export async function updateApplicationNotes(id: string, notes: string): Promise<Application> {
  const [record] = await db
    .update(applicationsTable)
    .set({ notes })
    .where(eq(applicationsTable.id, id))
    .returning();
  return record;
}

import { store } from "./store";

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

const COLLECTION = "applications";

export async function getApplications(): Promise<Application[]> {
  const items = await store.readAll<Application>(COLLECTION, []);
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addApplication(
  application: Omit<Application, "id" | "createdAt">
): Promise<Application> {
  const items = await store.readAll<Application>(COLLECTION, []);
  const record: Application = {
    ...application,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  items.push(record);
  await store.writeAll(COLLECTION, items);
  return record;
}

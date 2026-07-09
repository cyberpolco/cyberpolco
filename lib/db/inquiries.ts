import { store } from "./store";

export type Inquiry = {
  id: string;
  name: string;
  company: string;
  position: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  read: boolean;
};

const COLLECTION = "inquiries";

export async function getInquiries(): Promise<Inquiry[]> {
  const items = await store.readAll<Inquiry>(COLLECTION, []);
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addInquiry(
  inquiry: Omit<Inquiry, "id" | "createdAt" | "read">
): Promise<Inquiry> {
  const items = await store.readAll<Inquiry>(COLLECTION, []);
  const record: Inquiry = {
    ...inquiry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
  };
  items.push(record);
  await store.writeAll(COLLECTION, items);
  return record;
}

export async function markInquiryRead(id: string, read: boolean): Promise<void> {
  const items = await store.readAll<Inquiry>(COLLECTION, []);
  const idx = items.findIndex((i) => i.id === id);
  if (idx >= 0) {
    items[idx].read = read;
    await store.writeAll(COLLECTION, items);
  }
}

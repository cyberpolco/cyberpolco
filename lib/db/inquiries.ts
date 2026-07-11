import { eq } from "drizzle-orm";
import { db } from "./client";
import { inquiries as inquiriesTable } from "./schema";

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

export async function getInquiries(): Promise<Inquiry[]> {
  const items = await db.select().from(inquiriesTable);
  return items.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addInquiry(
  inquiry: Omit<Inquiry, "id" | "createdAt" | "read">
): Promise<Inquiry> {
  const [record] = await db
    .insert(inquiriesTable)
    .values({
      ...inquiry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      read: false,
    })
    .returning();
  return record;
}

export async function markInquiryRead(id: string, read: boolean): Promise<void> {
  await db.update(inquiriesTable).set({ read }).where(eq(inquiriesTable.id, id));
}

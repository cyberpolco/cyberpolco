import { eq } from "drizzle-orm";
import { db } from "./client";
import { messageTemplates as messageTemplatesTable } from "./schema";
import type { TemplateKey } from "@/lib/email/template-registry";

export type LocalizedTemplateContent = { subject: string; body: string };

export type MessageTemplate = {
  key: TemplateKey;
  channel: "email";
  fr: LocalizedTemplateContent;
  en: LocalizedTemplateContent;
  updatedAt: string;
  updatedBy: string | null;
};

export async function getTemplateRow(key: TemplateKey): Promise<MessageTemplate | undefined> {
  const [row] = await db.select().from(messageTemplatesTable).where(eq(messageTemplatesTable.key, key));
  return row as MessageTemplate | undefined;
}

export async function getAllTemplateRows(): Promise<MessageTemplate[]> {
  return db.select().from(messageTemplatesTable) as Promise<MessageTemplate[]>;
}

export async function saveTemplate(
  key: TemplateKey,
  content: { fr: LocalizedTemplateContent; en: LocalizedTemplateContent },
  updatedBy: string
): Promise<void> {
  const updatedAt = new Date().toISOString();
  await db
    .insert(messageTemplatesTable)
    .values({ key, fr: content.fr, en: content.en, updatedAt, updatedBy })
    .onConflictDoUpdate({
      target: messageTemplatesTable.key,
      set: { fr: content.fr, en: content.en, updatedAt, updatedBy },
    });
}

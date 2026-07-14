import { eq } from "drizzle-orm";
import { db } from "./client";
import { starlinkClients as starlinkClientsTable } from "./schema";

export type DishType = "enterprise" | "standard" | "mini";
export type InstallationStatus = "pending" | "scheduled" | "in_progress" | "completed";
export type DeploymentStatus = "not_deployed" | "deployed" | "active" | "suspended";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type SubscriptionType = "residential" | "business" | "roam" | "maritime";

export type StarlinkSite = {
  id: string;
  siteName: string;
  subscriptionType: SubscriptionType;
  dishType: DishType;
  installationStatus: InstallationStatus;
  kitOrderRef: string;
  deliveryDate: string | null;
  deploymentStatus: DeploymentStatus;
  wifiPassword: string;
  paymentStatus: PaymentStatus;
};

export type StarlinkClient = {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  sites: StarlinkSite[];
  createdAt: string;
};

export async function getStarlinkClients(): Promise<StarlinkClient[]> {
  return db.select().from(starlinkClientsTable);
}

export async function getStarlinkClientById(id: string): Promise<StarlinkClient | undefined> {
  const [row] = await db.select().from(starlinkClientsTable).where(eq(starlinkClientsTable.id, id));
  return row;
}

export async function saveStarlinkClient(client: StarlinkClient): Promise<void> {
  await db
    .insert(starlinkClientsTable)
    .values(client)
    .onConflictDoUpdate({ target: starlinkClientsTable.id, set: client });
}

export async function deleteStarlinkClient(id: string): Promise<void> {
  await db.delete(starlinkClientsTable).where(eq(starlinkClientsTable.id, id));
}

export async function getNextClientId(): Promise<string> {
  const rows = await db.select({ id: starlinkClientsTable.id }).from(starlinkClientsTable);
  return `STK-${String(rows.length + 1).padStart(4, "0")}`;
}

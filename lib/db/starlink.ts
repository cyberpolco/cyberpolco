import { eq } from "drizzle-orm";
import { db } from "./client";
import { starlinkClients as starlinkClientsTable } from "./schema";
import {
  INSTALLATION_STATUS_OPTIONS,
  DEPLOYMENT_STATUS_OPTIONS,
  SUBSCRIPTION_TYPE_OPTIONS,
} from "@/lib/content/starlink-options";

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

export type StarlinkStats = {
  totalClients: number;
  totalSites: number;
  paymentBreakdown: { paid: number; pending: number; overdue: number };
  installationByStatus: { label: string; value: number }[];
  deploymentByStatus: { label: string; value: number }[];
  subscriptionByType: { label: string; value: number }[];
};

function breakdown<K extends string>(
  sites: StarlinkSite[],
  options: readonly { value: K; label: string }[],
  pick: (site: StarlinkSite) => K
): { label: string; value: number }[] {
  return options.map((o) => ({
    label: o.label,
    value: sites.filter((s) => pick(s) === o.value).length,
  }));
}

export function computeStarlinkStats(clients: StarlinkClient[]): StarlinkStats {
  const sites = clients.flatMap((c) => c.sites);

  return {
    totalClients: clients.length,
    totalSites: sites.length,
    paymentBreakdown: {
      paid: sites.filter((s) => s.paymentStatus === "paid").length,
      pending: sites.filter((s) => s.paymentStatus === "pending").length,
      overdue: sites.filter((s) => s.paymentStatus === "overdue").length,
    },
    installationByStatus: breakdown(sites, INSTALLATION_STATUS_OPTIONS, (s) => s.installationStatus),
    deploymentByStatus: breakdown(sites, DEPLOYMENT_STATUS_OPTIONS, (s) => s.deploymentStatus),
    subscriptionByType: breakdown(sites, SUBSCRIPTION_TYPE_OPTIONS, (s) => s.subscriptionType),
  };
}

export async function getStarlinkStats(): Promise<StarlinkStats> {
  return computeStarlinkStats(await getStarlinkClients());
}

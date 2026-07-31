import { eq } from "drizzle-orm";
import { db } from "./client";
import { starlinkClients as starlinkClientsTable } from "./schema";
import {
  INSTALLATION_STATUS_OPTIONS,
  DEPLOYMENT_STATUS_OPTIONS,
  SUBSCRIPTION_TYPE_OPTIONS,
  DISH_TYPE_CODE,
  SUBSCRIPTION_TYPE_CODE,
  KIT_CLIENT_ID_PATTERN,
} from "@/lib/content/starlink-options";

export type DishType = "enterprise" | "standard" | "mini";
export type InstallationStatus = "pending" | "scheduled" | "in_progress" | "completed";
export type DeploymentStatus = "not_deployed" | "deployed" | "active" | "suspended";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type SubscriptionType = "residential" | "business" | "roam" | "250gb";
export type KitAcquisitionType = "acquired" | "leased";

export type StarlinkSite = {
  id: string;
  siteName: string;
  subscriptionType: SubscriptionType;
  dishType: DishType;
  installationStatus: InstallationStatus;
  kitOrderRef: string;
  kitClientId: string | null;
  kitEmail: string;
  kitAcquisitionType: KitAcquisitionType;
  deliveryDate: string | null;
  deploymentStatus: DeploymentStatus;
  wifiPassword: string;
  accountPassword: string;
  paymentStatus: PaymentStatus;
  // Monthly subscription: expiry = subscriptionStartDate + 30 days. Feeds a
  // planned future reminder (email via Resend + SMS to the client's phone,
  // 7 days before expiry) — not built yet, this field is the prerequisite.
  subscriptionStartDate: string | null;
};

export type StarlinkClient = {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  sites: StarlinkSite[];
  createdAt: string;
  createdBy: string | null;
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

export type KitClientIdRequest = {
  dishType: DishType;
  subscriptionType: SubscriptionType;
  deliveryDate: string | null;
};

/**
 * Assigns STKYYNNNNTDDSS ids to a batch of new kits in one shot, so multiple
 * sites added in the same form submission each get a distinct, correctly
 * incrementing sequence number instead of racing to read the same "current
 * max" from the DB. YY/NNNN track the kit's registration year (now); DD comes
 * from the kit's own delivery date (falling back to today if not yet set).
 */
export async function getNextKitClientIds(requests: KitClientIdRequest[]): Promise<string[]> {
  if (requests.length === 0) return [];

  const now = new Date();
  const clients = await getStarlinkClients();
  const maxByYear = new Map<string, number>();

  for (const client of clients) {
    for (const site of client.sites) {
      const id = site.kitClientId;
      if (!id || !KIT_CLIENT_ID_PATTERN.test(id)) continue;
      const yy = id.slice(3, 5);
      const seq = Number(id.slice(5, 9));
      maxByYear.set(yy, Math.max(maxByYear.get(yy) ?? 0, seq));
    }
  }

  return requests.map(({ dishType, subscriptionType, deliveryDate }) => {
    const delivery = deliveryDate ? new Date(deliveryDate) : now;
    const yy = String(now.getFullYear() % 100).padStart(2, "0");
    const dd = String(delivery.getDate()).padStart(2, "0");

    const next = (maxByYear.get(yy) ?? 0) + 1;
    maxByYear.set(yy, next);

    return `STK${yy}${String(next).padStart(4, "0")}${DISH_TYPE_CODE[dishType]}${dd}${SUBSCRIPTION_TYPE_CODE[subscriptionType]}`;
  });
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

/**
 * Days remaining until the next 30-day renewal boundary of a monthly
 * subscription, cycling indefinitely from subscriptionStartDate (day 1..30
 * of each cycle maps to 30..1 days remaining, then wraps). Returns null if
 * the subscription hasn't started yet. `now` is a parameter, not read
 * internally, so this stays a pure, deterministically testable function —
 * same pattern as lib/utils/monthly-trend.ts.
 */
export function daysUntilNextRenewal(subscriptionStartDate: string, now: Date): number | null {
  const start = new Date(subscriptionStartDate);
  const daysSinceStart = Math.floor((now.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
  if (daysSinceStart < 0) return null;
  return 30 - (daysSinceStart % 30);
}

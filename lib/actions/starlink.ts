"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { needsApproval } from "@/lib/auth/approval";
import { addPendingChange } from "@/lib/db/pending-changes";
import {
  saveStarlinkClient,
  getStarlinkClientById,
  deleteStarlinkClient,
  getNextClientId,
  getNextKitClientIds,
  type StarlinkClient,
  type StarlinkSite,
} from "@/lib/db/starlink";
import { isValidKitNumber, SUBSCRIPTION_TYPE_OPTIONS, type SubscriptionPricingCents } from "@/lib/content/starlink-options";
import { parseUsdToCents } from "@/lib/content/money";
import { getSettings, saveSettings } from "@/lib/db/settings";
import { isSubscriptionPayable } from "@/lib/starlink/subscription";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "");
}

async function parseSites(formData: FormData): Promise<StarlinkSite[]> {
  const siteCount = Number(formData.get("siteCount") || 0);
  type Draft = Omit<StarlinkSite, "kitClientId"> & { kitClientId: string | null };
  const drafts: Draft[] = [];

  for (let i = 0; i < siteCount; i++) {
    const id = field(formData, `site_${i}_id`) || crypto.randomUUID();
    const kitOrderRef = field(formData, `site_${i}_kitOrderRef`);
    if (!isValidKitNumber(kitOrderRef)) {
      throw new Error(
        `Invalid KIT Number "${kitOrderRef}" — expected format KIT404628363H4F (KIT + 9 digits + 3 letters/digits).`
      );
    }

    drafts.push({
      id,
      siteName: field(formData, `site_${i}_siteName`),
      subscriptionType: field(formData, `site_${i}_subscriptionType`) as StarlinkSite["subscriptionType"],
      dishType: field(formData, `site_${i}_dishType`) as StarlinkSite["dishType"],
      installationStatus: field(formData, `site_${i}_installationStatus`) as StarlinkSite["installationStatus"],
      kitOrderRef,
      kitClientId: field(formData, `site_${i}_kitClientId`) || null,
      kitEmail: field(formData, `site_${i}_kitEmail`),
      kitAcquisitionType: field(formData, `site_${i}_kitAcquisitionType`) as StarlinkSite["kitAcquisitionType"],
      deliveryDate: field(formData, `site_${i}_deliveryDate`) || null,
      deploymentStatus: field(formData, `site_${i}_deploymentStatus`) as StarlinkSite["deploymentStatus"],
      wifiPassword: field(formData, `site_${i}_wifiPassword`),
      accountPassword: field(formData, `site_${i}_accountPassword`),
      paymentStatus: field(formData, `site_${i}_paymentStatus`) as StarlinkSite["paymentStatus"],
      subscriptionStartDate: field(formData, `site_${i}_subscriptionStartDate`) || null,
    });
  }

  const needsId = drafts.filter((d) => !d.kitClientId);
  const newIds = await getNextKitClientIds(
    needsId.map((d) => ({
      dishType: d.dishType,
      subscriptionType: d.subscriptionType,
      deliveryDate: d.deliveryDate,
    }))
  );
  let cursor = 0;
  return drafts.map((d) => (d.kitClientId ? d : { ...d, kitClientId: newIds[cursor++] }));
}

export async function upsertStarlinkClientAction(formData: FormData) {
  const session = await requireRole(["super_admin", "technician"]);

  const existingId = field(formData, "id");
  const existingClientId = field(formData, "clientId");
  // Source createdAt/createdBy from the DB record itself, never from the
  // submitted form — needsApproval's decision depends on the authoritative
  // createdBy, which a client-submitted hidden field could otherwise spoof.
  const existing = existingId ? await getStarlinkClientById(existingId) : undefined;

  const client: StarlinkClient = {
    id: existingId || crypto.randomUUID(),
    clientId: existingClientId || (await getNextClientId()),
    name: field(formData, "name"),
    email: field(formData, "email"),
    phone: field(formData, "phone"),
    sites: await parseSites(formData),
    createdAt: existing ? existing.createdAt : new Date().toISOString(),
    createdBy: existing ? existing.createdBy : session.userId,
  };

  if (
    existing &&
    needsApproval({ existingRecord: existing, sessionUserId: session.userId, sessionRole: session.role })
  ) {
    await addPendingChange({
      targetTable: "starlink_client",
      targetId: existing.id,
      proposedData: client,
      proposedBy: session.userId,
    });
    redirect("/admin/starlink?pending=1");
  }

  await saveStarlinkClient(client);
  revalidatePath("/admin/starlink");
  redirect("/admin/starlink");
}

export async function deleteStarlinkClientAction(formData: FormData) {
  await requireRole(["super_admin"]);

  const id = field(formData, "id");
  await deleteStarlinkClient(id);
  revalidatePath("/admin/starlink");
}

export async function updateStarlinkPricingAction(formData: FormData) {
  const session = await requireRole(["super_admin", "technician"]);

  const current = await getSettings();
  const proposedPricing: SubscriptionPricingCents = { ...current.starlinkPricing };
  for (const { value } of SUBSCRIPTION_TYPE_OPTIONS) {
    const raw = field(formData, `price_${value}`).trim();
    if (!raw) continue;
    const cents = parseUsdToCents(raw);
    if (cents === null) throw new Error(`Invalid price "${raw}" for ${value} — expected a USD amount like 49.99.`);
    proposedPricing[value] = cents;
  }

  // Global pricing has no single owner/creator, so a technician's edit
  // always needs review — the same "no createdBy" fail-safe needsApproval
  // already applies to legacy per-record rows.
  if (
    needsApproval({ existingRecord: { createdBy: null }, sessionUserId: session.userId, sessionRole: session.role })
  ) {
    await addPendingChange({
      targetTable: "starlink_pricing",
      targetId: "singleton",
      proposedData: proposedPricing,
      proposedBy: session.userId,
    });
    redirect("/admin/starlink?pending=1");
  }

  await saveSettings({ ...current, starlinkPricing: proposedPricing });
  revalidatePath("/admin/starlink");
  revalidatePath("/admin/dashboard");
  redirect("/admin/starlink");
}

// Self-service, honor-system renewal: the client clicks "Pay" and their own
// site's cycle (identified from the session + a site id they don't control
// the outcome of, never a targetId that lets them touch another client's
// record) renews immediately. The disabled button is just UX — this
// re-checks the payable window server-side since forms can be resubmitted.
export async function payStarlinkSubscriptionAction(formData: FormData) {
  const session = await requireRole(["viewer"]);
  if (session.viewerType !== "starlink_client" || !session.linkedId) redirect("/admin/dashboard");

  const client = await getStarlinkClientById(session.linkedId);
  if (!client) redirect("/admin/dashboard");

  const siteId = field(formData, "siteId");
  const site = client.sites.find((s) => s.id === siteId);
  if (!site || !isSubscriptionPayable(site.subscriptionStartDate, new Date())) redirect("/admin/dashboard");

  const sites = client.sites.map((s) =>
    s.id === siteId ? { ...s, subscriptionStartDate: new Date().toISOString() } : s
  );
  await saveStarlinkClient({ ...client, sites });
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}

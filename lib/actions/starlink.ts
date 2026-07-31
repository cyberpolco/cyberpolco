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
  type StarlinkClient,
  type StarlinkSite,
} from "@/lib/db/starlink";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "");
}

function parseSites(formData: FormData): StarlinkSite[] {
  const siteCount = Number(formData.get("siteCount") || 0);
  const sites: StarlinkSite[] = [];

  for (let i = 0; i < siteCount; i++) {
    const id = field(formData, `site_${i}_id`) || crypto.randomUUID();
    sites.push({
      id,
      siteName: field(formData, `site_${i}_siteName`),
      subscriptionType: field(formData, `site_${i}_subscriptionType`) as StarlinkSite["subscriptionType"],
      dishType: field(formData, `site_${i}_dishType`) as StarlinkSite["dishType"],
      installationStatus: field(formData, `site_${i}_installationStatus`) as StarlinkSite["installationStatus"],
      kitOrderRef: field(formData, `site_${i}_kitOrderRef`),
      deliveryDate: field(formData, `site_${i}_deliveryDate`) || null,
      deploymentStatus: field(formData, `site_${i}_deploymentStatus`) as StarlinkSite["deploymentStatus"],
      wifiPassword: field(formData, `site_${i}_wifiPassword`),
      paymentStatus: field(formData, `site_${i}_paymentStatus`) as StarlinkSite["paymentStatus"],
    });
  }

  return sites;
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
    sites: parseSites(formData),
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

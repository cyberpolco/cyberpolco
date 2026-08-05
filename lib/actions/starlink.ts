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
  recordHelpResolution,
  type StarlinkClient,
  type StarlinkSite,
} from "@/lib/db/starlink";
import { isValidKitNumber, SUBSCRIPTION_TYPE_OPTIONS, type SubscriptionPricingCents } from "@/lib/content/starlink-options";
import { parseUsdToCents } from "@/lib/content/money";
import { getSettings, saveSettings } from "@/lib/db/settings";
import { isSubscriptionPayable } from "@/lib/starlink/subscription";
import { notifyTechniciansOfHelpRequest } from "@/lib/notifications/notify-technicians";
import { PHONE_REGEX } from "@/lib/validation/phone";
import { initiateDeposit, predictProvider, checkDepositStatus } from "@/lib/pawapay/client";
import {
  createPendingPawaPayTransaction,
  getPawaPayTransactionByPawaPayId,
  markPawaPayTransactionStatus,
} from "@/lib/db/payments";
import { applyDepositOutcome } from "@/lib/pawapay/reconcile";

function field(formData: FormData, name: string): string {
  return String(formData.get(name) || "");
}

async function parseSites(formData: FormData, existingSites: StarlinkSite[]): Promise<StarlinkSite[]> {
  const siteCount = Number(formData.get("siteCount") || 0);
  const existingById = new Map(existingSites.map((s) => [s.id, s]));
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
      // Not form-editable — carry it over so an unrelated edit can't
      // silently clear an open help request. Only
      // requestTechnicianHelpAction/resolveTechnicianHelpAction change this.
      helpRequestedAt: existingById.get(id)?.helpRequestedAt ?? null,
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
    sites: await parseSites(formData, existing?.sites ?? []),
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

// Self-service renewal: the client clicks "Pay", confirms/edits their
// mobile money number (identified from the session + a site id they don't
// control the outcome of, never a targetId that lets them touch another
// client's record), and we push a real PawaPay deposit request to their
// phone. The disabled button is just UX — this re-checks the payable
// window server-side since forms can be resubmitted. Unlike the old
// honor-system version, this does NOT flip paymentStatus/
// subscriptionStartDate itself — that only happens once the deposit
// reaches COMPLETED, via lib/pawapay/reconcile.ts (called from the
// callback route or refreshStarlinkDepositStatusAction below).
//
// Only Congolese (+243) numbers are supported for now: DRC is the only
// market this app has phone-format/business context for, and PawaPay's
// DRC mobile money providers (Airtel/Orange/Vodacom) all support USD
// deposits directly — so no currency conversion is needed against the
// existing USD-cents pricing (see lib/content/money.ts).
//
// Returns a result object rather than throwing for expected/validation
// failures — Next.js replaces a Server Action's thrown error message with a
// generic "omitted in production builds" string before it reaches the
// client, so a throw here would silently swallow the actual reason (bad
// phone, unsupported country, PawaPay rejection) in production. Only
// genuinely unexpected bugs should still throw, letting app/admin/error.tsx
// handle them.
export async function initiateStarlinkDepositAction(
  formData: FormData
): Promise<{ ok: true } | { ok: false; message: string }> {
  const session = await requireRole(["viewer"]);
  if (session.viewerType !== "starlink_client" || !session.linkedId) redirect("/admin/starlink/my-info");

  const client = await getStarlinkClientById(session.linkedId);
  if (!client) redirect("/admin/starlink/my-info");

  const siteId = field(formData, "siteId");
  const site = client.sites.find((s) => s.id === siteId);
  if (!site || !isSubscriptionPayable(site.subscriptionStartDate, new Date()))
    redirect("/admin/starlink/my-info");

  const phoneNumber = field(formData, "phoneNumber").trim();
  if (!PHONE_REGEX.test(phoneNumber)) {
    return { ok: false, message: "Enter a valid phone number with country code, e.g. +243991234567." };
  }

  let prediction;
  try {
    prediction = await predictProvider(phoneNumber);
  } catch (err) {
    console.error("PawaPay predict-provider failed:", err);
    return { ok: false, message: "Couldn't verify that phone number. Double-check it and try again." };
  }
  if (prediction.country !== "COD") {
    return { ok: false, message: "Mobile money payment is currently only available for Congolese (+243) numbers." };
  }

  const settings = await getSettings();
  const priceCents = settings.starlinkPricing[site.subscriptionType];
  const amount = (priceCents / 100).toFixed(2);
  const depositId = crypto.randomUUID();

  await createPendingPawaPayTransaction({
    pawapayId: depositId,
    type: "deposit",
    amount,
    currency: "USD",
    referenceType: "starlink_subscription",
    referenceId: site.id,
  });

  let result;
  try {
    result = await initiateDeposit({
      depositId,
      phoneNumber: prediction.phoneNumber,
      provider: prediction.provider,
      amount,
      currency: "USD",
      customerMessage: "Starlink renewal",
    });
  } catch (err) {
    await markPawaPayTransactionStatus(depositId, "FAILED", {});
    console.error("PawaPay initiate deposit failed:", err);
    return { ok: false, message: "Couldn't reach the mobile money provider. Please try again in a moment." };
  }

  if (result.status === "REJECTED") {
    await markPawaPayTransactionStatus(depositId, "REJECTED", result.failureReason ?? {});
    return {
      ok: false,
      message: result.failureReason?.failureMessage || "Your mobile money provider rejected this payment request.",
    };
  }

  revalidatePath("/admin/starlink/my-info");
  return { ok: true };
}

// Fallback for when PawaPay's webhook callback is delayed or — as in local
// development — can't reach this server at all (no public HTTPS URL to
// configure in the PawaPay dashboard). Scoped to the caller's own linked
// client/site, same as the rest of this file's self-service actions, so a
// viewer can't probe another client's payment status by guessing a
// depositId.
export async function refreshStarlinkDepositStatusAction(pawapayId: string): Promise<{ status: string }> {
  const session = await requireRole(["viewer"]);
  if (session.viewerType !== "starlink_client" || !session.linkedId) return { status: "UNKNOWN" };

  const tx = await getPawaPayTransactionByPawaPayId(pawapayId);
  if (!tx || tx.type !== "deposit" || tx.referenceType !== "starlink_subscription" || !tx.referenceId) {
    return { status: "UNKNOWN" };
  }

  const client = await getStarlinkClientById(session.linkedId);
  if (!client || !client.sites.some((s) => s.id === tx.referenceId)) return { status: "UNKNOWN" };

  if (tx.status === "COMPLETED" || tx.status === "FAILED") return { status: tx.status };

  const result = await checkDepositStatus(pawapayId);
  if (!result.found) return { status: tx.status };

  if (result.deposit.status === "COMPLETED" || result.deposit.status === "FAILED") {
    await markPawaPayTransactionStatus(
      pawapayId,
      result.deposit.status,
      result.deposit,
      result.deposit.payer?.accountDetails?.phoneNumber ?? null
    );
    await applyDepositOutcome(tx.referenceType, tx.referenceId, result.deposit.status);
    revalidatePath("/admin/starlink/my-info");
  }

  return { status: result.deposit.status };
}

// Self-service — the client raises a flag on one of their own sites
// (resolved via session.linkedId, never a submitted client id; only the
// siteId — scoped to look up within that already-session-resolved client's
// own sites — comes from the form). No approval queue: this is an
// operational alert, not a business-data edit.
export async function requestTechnicianHelpAction(formData: FormData) {
  const session = await requireRole(["viewer"]);
  if (session.viewerType !== "starlink_client" || !session.linkedId) redirect("/admin/dashboard");

  const client = await getStarlinkClientById(session.linkedId);
  if (!client) redirect("/admin/dashboard");

  const siteId = field(formData, "siteId");
  if (!client.sites.some((s) => s.id === siteId)) redirect("/admin/starlink/get-help");

  const sites = client.sites.map((s) =>
    s.id === siteId ? { ...s, helpRequestedAt: new Date().toISOString() } : s
  );
  await saveStarlinkClient({ ...client, sites });

  // A notification failure must never block recording the help request
  // itself (the DB write above already succeeded) — the helper already
  // catches per-technician send errors; this outer catch guards against the
  // whole lookup/dispatch failing (e.g. DB down for getTechnicianEmails).
  try {
    await notifyTechniciansOfHelpRequest({
      clientName: client.name,
      clientId: client.clientId,
      siteName: sites.find((s) => s.id === siteId)?.siteName ?? "",
    });
  } catch (err) {
    console.error("Failed to notify technicians of help request:", err);
  }

  revalidatePath("/admin/starlink/get-help");
  revalidatePath("/admin/starlink");
  redirect("/admin/starlink/get-help");
}

// Resolves every open help request for this client in one action (a
// technician visit typically addresses all of a client's open issues at
// once) rather than requiring one click per site. Each resolved site gets
// its own history row before helpRequestedAt is cleared, since that's the
// only place "who resolved it, when" ever gets recorded.
export async function resolveTechnicianHelpAction(formData: FormData) {
  const session = await requireRole(["super_admin", "technician"]);

  const id = field(formData, "id");
  const client = await getStarlinkClientById(id);
  if (!client) return;

  const resolvedAt = new Date().toISOString();
  const sitesNeedingHelp = client.sites.filter((s) => s.helpRequestedAt);
  await Promise.all(
    sitesNeedingHelp.map((s) =>
      recordHelpResolution({
        clientId: client.id,
        siteId: s.id,
        siteName: s.siteName,
        requestedAt: s.helpRequestedAt!,
        resolvedAt,
        resolvedBy: session.userId,
      })
    )
  );

  const sites = client.sites.map((s) => (s.helpRequestedAt ? { ...s, helpRequestedAt: null } : s));
  await saveStarlinkClient({ ...client, sites });
  revalidatePath("/admin/starlink");
  revalidatePath(`/admin/starlink/${id}/edit`);
}

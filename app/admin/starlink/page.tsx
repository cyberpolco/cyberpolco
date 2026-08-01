import Link from "next/link";
import { Plus } from "lucide-react";
import { getStarlinkClients } from "@/lib/db/starlink";
import { getPendingChanges } from "@/lib/db/pending-changes";
import { getSettings } from "@/lib/db/settings";
import { requireRole } from "@/lib/auth/rbac";
import StarlinkClientsTable from "./_components/StarlinkClientsTable";
import SubscriptionPricingForm from "./_components/SubscriptionPricingForm";

export default async function StarlinkClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ pending?: string }>;
}) {
  const session = await requireRole(["super_admin", "technician"]);
  const { pending } = await searchParams;

  const [clients, pendingChanges, settings] = await Promise.all([
    getStarlinkClients(),
    getPendingChanges("pending"),
    getSettings(),
  ]);
  const pendingTargetIds = new Set(
    pendingChanges.filter((c) => c.targetTable === "starlink_client").map((c) => c.targetId)
  );
  const pricingPending = pendingChanges.some((c) => c.targetTable === "starlink_pricing");

  return (
    <div>
      {pending === "1" && (
        <div className="mb-4 rounded-xl bg-brand-blue/10 p-4 text-sm text-brand-dark dark:text-white">
          Your changes have been submitted for super_admin approval.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Starlink Management</h1>
        <Link
          href="/admin/starlink/new"
          className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white"
        >
          <Plus size={16} /> New client
        </Link>
      </div>

      <div className="mt-6">
        <SubscriptionPricingForm
          pricing={settings.starlinkPricing}
          isSuperAdmin={session.role === "super_admin"}
          isPending={pricingPending}
        />
      </div>

      <div className="mt-6">
        <StarlinkClientsTable
          clients={clients}
          pendingTargetIds={pendingTargetIds}
          canDelete={session.role === "super_admin"}
        />
      </div>
    </div>
  );
}

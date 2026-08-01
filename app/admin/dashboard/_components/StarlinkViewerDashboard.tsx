import Link from "next/link";
import { SatelliteDish, Timer } from "lucide-react";
import { computeStarlinkStats, daysUntilNextRenewal, type StarlinkClient } from "@/lib/db/starlink";
import PaymentStatusTiles from "./PaymentStatusTiles";
import RankedBarList from "./RankedBarList";

// Stats-only overview — the interactive parts (full site detail, WiFi
// password, paying, speed test, requesting help) live on their own pages
// now (My Info / Speed Test / Get Help).
export default function StarlinkViewerDashboard({ client }: { client: StarlinkClient | undefined }) {
  if (!client) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Dashboard</h1>
        <p className="mt-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          Your account isn&apos;t linked to a Starlink client record yet. Contact your
          administrator.
        </p>
      </div>
    );
  }

  const stats = computeStarlinkStats([client]);
  const now = new Date();

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">Welcome, {client.name}</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">Client ID: {client.clientId}</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <Link
          href="/admin/starlink/my-info"
          className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 transition-shadow hover:shadow-md"
        >
          <SatelliteDish className="text-brand-blue" size={22} />
          <p className="mt-4 text-3xl font-bold text-brand-dark dark:text-white">{stats.totalSites}</p>
          <p className="mt-1 text-sm text-brand-gray dark:text-white/60">Sites — view full details</p>
        </Link>

        <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
          <Timer className="text-brand-blue" size={22} />
          <div className="mt-4 space-y-1.5">
            {client.sites.map((site) => {
              const days = site.subscriptionStartDate
                ? daysUntilNextRenewal(site.subscriptionStartDate, now)
                : null;
              return (
                <div key={site.id} className="flex items-center justify-between text-sm">
                  <span className="truncate font-medium text-brand-dark dark:text-white">{site.siteName}</span>
                  <span className="shrink-0 text-brand-gray dark:text-white/60">
                    {days === null ? "Not started" : `${days} day${days === 1 ? "" : "s"} to renewal`}
                  </span>
                </div>
              );
            })}
            {client.sites.length === 0 && (
              <p className="text-sm text-brand-gray dark:text-white/60">No sites on file yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">
          Payment status
        </p>
        <PaymentStatusTiles
          paid={stats.paymentBreakdown.paid}
          pending={stats.paymentBreakdown.pending}
          overdue={stats.paymentBreakdown.overdue}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <RankedBarList
          title="Sites by installation status"
          colorClassName="bg-brand-blue"
          items={stats.installationByStatus}
        />
        <RankedBarList
          title="Sites by deployment status"
          colorClassName="bg-brand-blue"
          items={stats.deploymentByStatus}
        />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { MapPin, Wifi } from "lucide-react";
import { getSession } from "@/lib/auth/rbac";
import { getStarlinkClientById } from "@/lib/db/starlink";
import { getSettings } from "@/lib/db/settings";
import { STARLINK_OPTION_LABELS } from "@/lib/content/starlink-options";
import { formatUsdCents } from "@/lib/content/money";
import { isSubscriptionPayable } from "@/lib/starlink/subscription";
import { payStarlinkSubscriptionAction } from "@/lib/actions/starlink";
import RevealText from "@/app/admin/_components/RevealText";
import SubmitButton from "@/app/admin/_components/SubmitButton";

export default async function MyInfoPage() {
  const session = await getSession();
  if (session?.role !== "viewer" || session.viewerType !== "starlink_client") redirect("/admin/dashboard");

  const [client, settings] = await Promise.all([
    session.linkedId ? getStarlinkClientById(session.linkedId) : Promise.resolve(undefined),
    getSettings(),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-dark dark:text-white">My Info</h1>
      <p className="mt-1 text-brand-gray dark:text-white/60">
        Read-only — contact your administrator to update these details.
      </p>

      {!client ? (
        <p className="mt-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 p-6 text-sm text-brand-gray dark:text-white/60">
          Your account isn&apos;t linked to a Starlink client record yet. Contact your administrator.
        </p>
      ) : (
        <>
          <dl className="mt-6 max-w-lg space-y-2 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 text-sm">
            <Row label="Client ID" value={client.clientId} />
            <Row label="Name" value={client.name} />
            <Row label="Email" value={client.email} />
            <Row label="Phone" value={client.phone} />
          </dl>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {client.sites.map((site) => {
              const priceCents = settings.starlinkPricing[site.subscriptionType];
              const payable = isSubscriptionPayable(site.subscriptionStartDate, new Date());

              return (
                <div
                  key={site.id}
                  className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6"
                >
                  <div className="flex items-center gap-2 text-brand-dark dark:text-white">
                    <MapPin size={16} className="text-brand-blue" />
                    <h2 className="font-semibold">{site.siteName}</h2>
                  </div>
                  <dl className="mt-4 space-y-2 text-sm">
                    <Row label="Subscription" value={STARLINK_OPTION_LABELS.subscriptionType[site.subscriptionType]} />
                    <Row label="Price" value={`${formatUsdCents(priceCents)}/mo`} />
                    <Row label="Dish type" value={STARLINK_OPTION_LABELS.dishType[site.dishType]} />
                    <Row
                      label="Installation"
                      value={STARLINK_OPTION_LABELS.installationStatus[site.installationStatus]}
                    />
                    <Row label="Deployment" value={STARLINK_OPTION_LABELS.deploymentStatus[site.deploymentStatus]} />
                    <Row label="Payment" value={STARLINK_OPTION_LABELS.paymentStatus[site.paymentStatus]} />
                    <div className="flex items-center justify-between">
                      <dt className="flex items-center gap-1 text-brand-gray dark:text-white/60">
                        <Wifi size={14} /> WiFi password
                      </dt>
                      <dd>
                        <RevealText value={site.wifiPassword} />
                      </dd>
                    </div>
                  </dl>

                  <form action={payStarlinkSubscriptionAction} className="mt-4">
                    <input type="hidden" name="siteId" value={site.id} />
                    <SubmitButton variant="subtle" disabled={!payable} pendingLabel="Processing..." className="w-full">
                      {payable ? `Pay ${formatUsdCents(priceCents)}` : "Not due for renewal yet"}
                    </SubmitButton>
                  </form>
                </div>
              );
            })}
            {client.sites.length === 0 && (
              <p className="rounded-xl border border-dashed border-black/15 dark:border-white/15 p-6 text-center text-sm text-brand-gray dark:text-white/60 sm:col-span-2">
                No sites on file yet.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-brand-gray dark:text-white/60">{label}</dt>
      <dd className="font-medium text-brand-dark dark:text-white">{value}</dd>
    </div>
  );
}

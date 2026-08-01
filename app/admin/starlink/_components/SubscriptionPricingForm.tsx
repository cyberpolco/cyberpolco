import { updateStarlinkPricingAction } from "@/lib/actions/starlink";
import { SUBSCRIPTION_TYPE_OPTIONS, type SubscriptionPricingCents } from "@/lib/content/starlink-options";
import SubmitButton from "@/app/admin/_components/SubmitButton";

export default function SubscriptionPricingForm({
  pricing,
  isSuperAdmin,
  isPending,
}: {
  pricing: SubscriptionPricingCents;
  isSuperAdmin: boolean;
  isPending: boolean;
}) {
  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-blue">Subscription pricing (USD/mo)</h2>
        {isPending && (
          <span className="rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-semibold text-status-warning">
            Pending review
          </span>
        )}
      </div>

      <form action={updateStarlinkPricingAction} className="mt-4 flex flex-wrap gap-4">
        {SUBSCRIPTION_TYPE_OPTIONS.map(({ value, label }) => (
          <div key={value}>
            <label className="mb-1 block text-xs font-medium text-brand-gray dark:text-white/60">{label}</label>
            <div className="flex items-center gap-1.5">
              <span className="text-brand-gray dark:text-white/60">$</span>
              <input
                name={`price_${value}`}
                type="number"
                min={0}
                step="0.01"
                defaultValue={(pricing[value] / 100).toFixed(2)}
                className="w-24 rounded-lg border border-black/10 dark:border-white/15 px-3 py-2 text-sm dark:bg-white/5 dark:text-white"
              />
            </div>
          </div>
        ))}
        <div className="flex items-end">
          <SubmitButton variant="subtle" pendingLabel="Saving...">
            {isSuperAdmin ? "Save pricing" : "Submit for approval"}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}

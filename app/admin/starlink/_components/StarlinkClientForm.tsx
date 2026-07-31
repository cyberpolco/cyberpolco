"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import RevealField from "@/app/admin/_components/RevealField";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { upsertStarlinkClientAction } from "@/lib/actions/starlink";
import {
  SUBSCRIPTION_TYPE_OPTIONS,
  DISH_TYPE_OPTIONS,
  INSTALLATION_STATUS_OPTIONS,
  DEPLOYMENT_STATUS_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  KIT_ACQUISITION_TYPE_OPTIONS,
  KIT_NUMBER_PATTERN,
} from "@/lib/content/starlink-options";
import type { StarlinkClient, StarlinkSite } from "@/lib/db/starlink";

export default function StarlinkClientForm({ client }: { client?: StarlinkClient }) {
  const counter = useRef(0);
  const [rows, setRows] = useState<{ key: string; site?: StarlinkSite }[]>(() =>
    (client?.sites ?? []).map((site) => ({ key: site.id, site }))
  );

  function addSite() {
    counter.current += 1;
    setRows((r) => [...r, { key: `new-${counter.current}` }]);
  }

  function removeSite(key: string) {
    setRows((r) => r.filter((row) => row.key !== key));
  }

  return (
    <form action={upsertStarlinkClientAction} className="space-y-8">
      {client && <input type="hidden" name="id" value={client.id} />}
      {client && <input type="hidden" name="clientId" value={client.clientId} />}
      {client && <input type="hidden" name="createdAt" value={client.createdAt} />}
      <input type="hidden" name="siteCount" value={rows.length} />

      <div className="grid gap-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Name</label>
          <input
            name="name"
            defaultValue={client?.name}
            required
            className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Email</label>
          <input
            type="email"
            name="email"
            defaultValue={client?.email}
            required
            className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Phone</label>
          <input
            name="phone"
            defaultValue={client?.phone}
            required
            className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-blue">Sites</h2>
          <button
            type="button"
            onClick={addSite}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-blue"
          >
            <Plus size={16} /> Add site
          </button>
        </div>

        <div className="mt-4 space-y-6">
          {rows.map((row, i) => (
            <div key={row.key} className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-5">
              <input type="hidden" name={`site_${i}_id`} value={row.site?.id ?? ""} />
              <input type="hidden" name={`site_${i}_kitClientId`} value={row.site?.kitClientId ?? ""} />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-brand-dark dark:text-white">Site {i + 1}</p>
                  {row.site?.kitClientId ? (
                    <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 font-mono text-xs font-semibold text-brand-blue">
                      {row.site.kitClientId}
                    </span>
                  ) : (
                    <span className="rounded-full bg-black/5 dark:bg-white/10 px-2 py-0.5 text-xs text-brand-gray dark:text-white/60">
                      Client ID assigned on save
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeSite(row.key)}
                  className="text-brand-red"
                  aria-label="Remove site"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field
                  label="Site name"
                  name={`site_${i}_siteName`}
                  defaultValue={row.site?.siteName}
                />
                <div>
                  <Field
                    label="KIT Number"
                    name={`site_${i}_kitOrderRef`}
                    defaultValue={row.site?.kitOrderRef}
                    pattern={KIT_NUMBER_PATTERN.source}
                    title="Format: KIT followed by 9 digits and 3 letters/digits, e.g. KIT404628363H4F"
                  />
                  <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
                    Format: KIT404628363H4F (KIT + 9 digits + 3 letters/digits)
                  </p>
                </div>
                <Field
                  label="Kit's Email"
                  name={`site_${i}_kitEmail`}
                  type="email"
                  required={false}
                  defaultValue={row.site?.kitEmail}
                />
                <Select
                  label="Kit acquisition"
                  name={`site_${i}_kitAcquisitionType`}
                  defaultValue={row.site?.kitAcquisitionType}
                  options={KIT_ACQUISITION_TYPE_OPTIONS}
                />
                <Select
                  label="Subscription type"
                  name={`site_${i}_subscriptionType`}
                  defaultValue={row.site?.subscriptionType}
                  options={SUBSCRIPTION_TYPE_OPTIONS}
                />
                <Select
                  label="Dish type"
                  name={`site_${i}_dishType`}
                  defaultValue={row.site?.dishType}
                  options={DISH_TYPE_OPTIONS}
                />
                <Select
                  label="Installation status"
                  name={`site_${i}_installationStatus`}
                  defaultValue={row.site?.installationStatus}
                  options={INSTALLATION_STATUS_OPTIONS}
                />
                <Select
                  label="Deployment status"
                  name={`site_${i}_deploymentStatus`}
                  defaultValue={row.site?.deploymentStatus}
                  options={DEPLOYMENT_STATUS_OPTIONS}
                />
                <Select
                  label="Payment status"
                  name={`site_${i}_paymentStatus`}
                  defaultValue={row.site?.paymentStatus}
                  options={PAYMENT_STATUS_OPTIONS}
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
                    Delivery date
                  </label>
                  <input
                    type="date"
                    name={`site_${i}_deliveryDate`}
                    defaultValue={row.site?.deliveryDate ?? ""}
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">
                    Subscription start date
                  </label>
                  <input
                    type="date"
                    name={`site_${i}_subscriptionStartDate`}
                    defaultValue={row.site?.subscriptionStartDate ?? ""}
                    className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
                  />
                  <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
                    Monthly subscription — renews every 30 days from this date.
                  </p>
                </div>
                <RevealField
                  label="WiFi password"
                  name={`site_${i}_wifiPassword`}
                  defaultValue={row.site?.wifiPassword}
                />
                <RevealField
                  label="Account password"
                  name={`site_${i}_accountPassword`}
                  defaultValue={row.site?.accountPassword}
                />
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="rounded-xl border border-dashed border-black/15 dark:border-white/15 p-6 text-center text-sm text-brand-gray dark:text-white/60">
              No sites yet. Add one above.
            </p>
          )}
        </div>
      </div>

      <SubmitButton pendingLabel={client ? "Saving..." : "Creating..."}>
        {client ? "Save changes" : "Create client"}
      </SubmitButton>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = "text",
  required = true,
  pattern,
  title,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  type?: string;
  required?: boolean;
  pattern?: string;
  title?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        pattern={pattern}
        title={title}
        className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
      />
    </div>
  );
}

function Select({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue ?? options[0].value}
        className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

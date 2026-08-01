export const SUBSCRIPTION_TYPE_OPTIONS = [
  { value: "residential", label: "Residential" },
  { value: "business", label: "Business" },
  { value: "roam", label: "Roam" },
  { value: "250gb", label: "250GB" },
] as const;

export const DISH_TYPE_OPTIONS = [
  { value: "enterprise", label: "Enterprise" },
  { value: "standard", label: "Standard" },
  { value: "mini", label: "Mini" },
] as const;

export const INSTALLATION_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "scheduled", label: "Scheduled" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
] as const;

export const DEPLOYMENT_STATUS_OPTIONS = [
  { value: "not_deployed", label: "Not deployed" },
  { value: "deployed", label: "Deployed" },
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
] as const;

export const PAYMENT_STATUS_OPTIONS = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
] as const;

export const KIT_ACQUISITION_TYPE_OPTIONS = [
  { value: "acquired", label: "Acquired" },
  { value: "leased", label: "Leased" },
] as const;

// KIT + 9 digits + 3 letters/digits, e.g. KIT404628363H4F. Shared by the
// form's client-side pattern attribute (instant feedback) and the Server
// Action's authoritative check (lib/actions/starlink.ts) — the form
// submission can't be trusted to have gone through browser validation.
export const KIT_NUMBER_PATTERN = /^KIT\d{9}[A-Za-z0-9]{3}$/;

export function isValidKitNumber(value: string): boolean {
  return KIT_NUMBER_PATTERN.test(value);
}

// Per-site (kit) identifier: STK + YY (year) + NNNN (yearly global sequence)
// + T (dish type letter) + DD (delivery day) + SS (subscription code).
// e.g. STK260154E18RE. See docs/starlink-kit-client-id-spec for the full spec.
// One client can own many sites, so a client can have many of these.
export const KIT_CLIENT_ID_PATTERN = /^STK\d{2}\d{4}[SME]\d{2}(RE|BU|RO|GB)$/;

export function isValidKitClientId(value: string): boolean {
  return KIT_CLIENT_ID_PATTERN.test(value);
}

// Per-client identifier: STK-NNNN (see getNextClientId). Distinct from the
// per-site Client ID above — this one identifies the client account itself.
export const CLIENT_ID_PATTERN = /^STK-\d{4}$/;

export function isValidClientId(value: string): boolean {
  return CLIENT_ID_PATTERN.test(value);
}

export const DISH_TYPE_CODE: Record<(typeof DISH_TYPE_OPTIONS)[number]["value"], string> = {
  standard: "S",
  mini: "M",
  enterprise: "E",
};

export const SUBSCRIPTION_TYPE_CODE: Record<(typeof SUBSCRIPTION_TYPE_OPTIONS)[number]["value"], string> = {
  residential: "RE",
  business: "BU",
  roam: "RO",
  "250gb": "GB",
};

// Monthly price in USD cents, one per Subscription type — super_admin-only
// (see lib/db/settings.ts, lib/actions/starlink.ts). Defaults to 0 ("not set
// yet") until a super_admin configures real pricing.
export type SubscriptionPricingCents = Record<(typeof SUBSCRIPTION_TYPE_OPTIONS)[number]["value"], number>;

export const SUBSCRIPTION_PRICING_DEFAULTS_CENTS: SubscriptionPricingCents = {
  residential: 0,
  business: 0,
  roam: 0,
  "250gb": 0,
};

export const STARLINK_OPTION_LABELS = {
  subscriptionType: Object.fromEntries(SUBSCRIPTION_TYPE_OPTIONS.map((o) => [o.value, o.label])),
  dishType: Object.fromEntries(DISH_TYPE_OPTIONS.map((o) => [o.value, o.label])),
  installationStatus: Object.fromEntries(INSTALLATION_STATUS_OPTIONS.map((o) => [o.value, o.label])),
  deploymentStatus: Object.fromEntries(DEPLOYMENT_STATUS_OPTIONS.map((o) => [o.value, o.label])),
  paymentStatus: Object.fromEntries(PAYMENT_STATUS_OPTIONS.map((o) => [o.value, o.label])),
  kitAcquisitionType: Object.fromEntries(KIT_ACQUISITION_TYPE_OPTIONS.map((o) => [o.value, o.label])),
} as const;

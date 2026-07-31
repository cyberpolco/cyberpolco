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

export const STARLINK_OPTION_LABELS = {
  subscriptionType: Object.fromEntries(SUBSCRIPTION_TYPE_OPTIONS.map((o) => [o.value, o.label])),
  dishType: Object.fromEntries(DISH_TYPE_OPTIONS.map((o) => [o.value, o.label])),
  installationStatus: Object.fromEntries(INSTALLATION_STATUS_OPTIONS.map((o) => [o.value, o.label])),
  deploymentStatus: Object.fromEntries(DEPLOYMENT_STATUS_OPTIONS.map((o) => [o.value, o.label])),
  paymentStatus: Object.fromEntries(PAYMENT_STATUS_OPTIONS.map((o) => [o.value, o.label])),
  kitAcquisitionType: Object.fromEntries(KIT_ACQUISITION_TYPE_OPTIONS.map((o) => [o.value, o.label])),
} as const;

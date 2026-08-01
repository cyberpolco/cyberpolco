const SUBSCRIPTION_PERIOD_DAYS = 30;
const PAYABLE_WINDOW_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function subscriptionExpiryDate(subscriptionStartDate: string | null): Date | null {
  if (!subscriptionStartDate) return null;
  return new Date(new Date(subscriptionStartDate).getTime() + SUBSCRIPTION_PERIOD_DAYS * MS_PER_DAY);
}

// No start date yet means the subscription has never been paid, so it's
// always payable. Otherwise the Pay button only unlocks in the last 7 days
// of the current 30-day cycle (or once it's already overdue).
export function isSubscriptionPayable(subscriptionStartDate: string | null, now: Date): boolean {
  const expiry = subscriptionExpiryDate(subscriptionStartDate);
  if (!expiry) return true;
  const daysRemaining = (expiry.getTime() - now.getTime()) / MS_PER_DAY;
  return daysRemaining <= PAYABLE_WINDOW_DAYS;
}

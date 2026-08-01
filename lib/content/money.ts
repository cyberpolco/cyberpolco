// USD amounts are stored in cents everywhere to avoid floating-point
// rounding issues; these are the only functions that convert to/from the
// dollars-and-cents string a human types into a form.
const USD_INPUT_PATTERN = /^\d+(\.\d{1,2})?$/;

export function parseUsdToCents(value: string): number | null {
  const trimmed = value.trim();
  if (!USD_INPUT_PATTERN.test(trimmed)) return null;
  return Math.round(Number(trimmed) * 100);
}

export function formatUsdCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Buckets rows with a createdAt ISO timestamp into calendar months, trailing
 * back `months` months from `now` (inclusive), zero-filling months with no
 * rows so a chart's x-axis stays continuous. `now` is a parameter (not
 * read internally) so this stays a pure, deterministically testable function.
 * `valueOf` lets a bucket sum something other than a plain count (e.g.
 * dollars collected that month) — defaults to counting each item as 1.
 */
export function monthlyTrend<T extends { createdAt: string }>(
  items: T[],
  months: number = 12,
  now: Date = new Date(),
  valueOf: (item: T) => number = () => 1
): { label: string; value: number }[] {
  const buckets: { key: string; label: string }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    });
  }

  const totals = new Map(buckets.map((b) => [b.key, 0]));
  for (const item of items) {
    const d = new Date(item.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (totals.has(key)) totals.set(key, (totals.get(key) ?? 0) + valueOf(item));
  }

  return buckets.map((b) => ({ label: b.label, value: totals.get(b.key) ?? 0 }));
}

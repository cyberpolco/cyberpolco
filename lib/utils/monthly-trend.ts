/**
 * Buckets rows with a createdAt ISO timestamp into calendar months, trailing
 * back `months` months from `now` (inclusive), zero-filling months with no
 * rows so a chart's x-axis stays continuous. `now` is a parameter (not
 * read internally) so this stays a pure, deterministically testable function.
 */
export function monthlyTrend(
  items: { createdAt: string }[],
  months: number = 12,
  now: Date = new Date()
): { label: string; value: number }[] {
  const buckets: { key: string; label: string }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
    });
  }

  const counts = new Map(buckets.map((b) => [b.key, 0]));
  for (const item of items) {
    const d = new Date(item.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return buckets.map((b) => ({ label: b.label, value: counts.get(b.key) ?? 0 }));
}

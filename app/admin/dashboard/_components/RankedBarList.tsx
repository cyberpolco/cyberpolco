export default function RankedBarList({
  title,
  items,
  colorClassName,
  colors,
}: {
  title: string;
  items: { label: string; value: number; href?: string }[];
  // Either a single Tailwind class applied to every bar (nominal — the
  // items aren't ordered relative to each other), or one CSS color per
  // item, in item order (ordinal — e.g. a pipeline's fixed stage order,
  // rendered as a monotone lightness ramp). Exactly one of the two is
  // expected; colors takes precedence if both are somehow passed.
  colorClassName?: string;
  colors?: string[];
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item, i) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-medium text-brand-dark dark:text-white">{item.label}</span>
              <span className="shrink-0 tabular-nums text-brand-gray dark:text-white/60">{item.value}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/5 dark:bg-white/10">
              <div
                className={`h-full rounded-full ${colors ? "" : colorClassName}`}
                style={{
                  width: `${(item.value / max) * 100}%`,
                  ...(colors ? { backgroundColor: colors[i % colors.length] } : {}),
                }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-brand-gray dark:text-white/60">Not enough data yet.</p>}
      </div>
    </div>
  );
}

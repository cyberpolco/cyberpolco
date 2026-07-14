export default function RankedBarList({
  title,
  items,
  colorClassName,
}: {
  title: string;
  items: { label: string; value: number; href?: string }[];
  colorClassName: string;
}) {
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="rounded-2xl border border-black/5 bg-white p-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-gray">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate font-medium text-brand-dark">{item.label}</span>
              <span className="shrink-0 tabular-nums text-brand-gray">{item.value}</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-black/5">
              <div
                className={`h-full rounded-full ${colorClassName}`}
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-sm text-brand-gray">Not enough data yet.</p>}
      </div>
    </div>
  );
}

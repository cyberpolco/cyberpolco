export default function SpeedGauge({
  value,
  max,
  label,
  unit,
  active,
  decimals = 1,
}: {
  value: number;
  max: number;
  label: string;
  unit: string;
  active: boolean;
  decimals?: number;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(value / max, 1));
  const offset = circumference * (1 - pct);

  // Sub-1 Mbps throughput reads as an uninformative "0.1" on this gauge —
  // switch to kbps below that threshold so a slow/degraded link still shows
  // a legible number instead of looking like nothing is happening. The ring
  // itself keeps using the raw Mbps value/max above so its percentage stays
  // consistent as the reading crosses the 1 Mbps boundary.
  const showKbps = unit === "Mbps" && value > 0 && value < 1;
  const displayValue = showKbps ? value * 1000 : value;
  const displayUnit = showKbps ? "kbps" : unit;
  const displayDecimals = showKbps ? 0 : decimals;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-36 w-36">
        {active && (
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-brand-blue/30 [animation-duration:3s]" />
        )}
        <svg width="144" height="144" viewBox="0 0 144 144" className="-rotate-90">
          <circle cx="72" cy="72" r={radius} fill="none" strokeWidth="10" className="stroke-black/5 dark:stroke-white/10" />
          <circle
            cx="72"
            cy="72"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="stroke-brand-blue transition-[stroke-dashoffset] duration-200 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold tabular-nums text-brand-dark dark:text-white">
            {value > 0 ? displayValue.toFixed(displayDecimals) : "—"}
          </span>
          <span className="text-xs text-brand-gray dark:text-white/60">{displayUnit}</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-brand-gray dark:text-white/60">{label}</p>
    </div>
  );
}

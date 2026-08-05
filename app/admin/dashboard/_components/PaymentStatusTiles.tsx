import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export type PaymentStatusTile = { label: string; value: number; tone: "good" | "warning" | "critical" };

const TONE_ICON: Record<PaymentStatusTile["tone"], typeof CheckCircle2> = {
  good: CheckCircle2,
  warning: Clock,
  critical: AlertTriangle,
};
const TONE_CLASSES: Record<PaymentStatusTile["tone"], { colorClass: string; chipClass: string }> = {
  good: { colorClass: "text-status-good", chipClass: "bg-status-good/10" },
  warning: { colorClass: "text-status-warning", chipClass: "bg-status-warning/15" },
  critical: { colorClass: "text-status-critical", chipClass: "bg-status-critical/10" },
};

export default function PaymentStatusTiles({ tiles }: { tiles: PaymentStatusTile[] }) {
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}>
      {tiles.map(({ label, value, tone }) => {
        const Icon = TONE_ICON[tone];
        const { colorClass, chipClass } = TONE_CLASSES[tone];
        return (
          <div
            key={label}
            className="flex items-center gap-3 rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-4"
          >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${chipClass}`}>
              <Icon size={18} className={colorClass} />
            </span>
            <div>
              <p className="text-xl font-bold text-brand-dark dark:text-white">{value}</p>
              <p className="text-xs text-brand-gray dark:text-white/60">{label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

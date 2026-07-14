import { CheckCircle2, Clock, AlertTriangle } from "lucide-react";

export default function PaymentStatusTiles({
  paid,
  pending,
  overdue,
}: {
  paid: number;
  pending: number;
  overdue: number;
}) {
  const tiles = [
    { label: "Paid", value: paid, Icon: CheckCircle2, colorClass: "text-status-good", chipClass: "bg-status-good/10" },
    { label: "Pending", value: pending, Icon: Clock, colorClass: "text-status-warning", chipClass: "bg-status-warning/15" },
    { label: "Overdue", value: overdue, Icon: AlertTriangle, colorClass: "text-status-critical", chipClass: "bg-status-critical/10" },
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {tiles.map(({ label, value, Icon, colorClass, chipClass }) => (
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
      ))}
    </div>
  );
}

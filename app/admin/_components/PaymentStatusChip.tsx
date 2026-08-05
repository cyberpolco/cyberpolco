const COMPLETED_STATUSES = new Set(["COMPLETED"]);
const FAILED_STATUSES = new Set(["FAILED", "REJECTED"]);

const TONE_CLASSES = {
  good: "bg-status-good/10 text-status-good",
  warning: "bg-status-warning/15 text-status-warning",
  critical: "bg-status-critical/10 text-status-critical",
} as const;

export default function PaymentStatusChip({ status }: { status: string }) {
  const tone = COMPLETED_STATUSES.has(status) ? "good" : FAILED_STATUSES.has(status) ? "critical" : "warning";

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}>
      {status}
    </span>
  );
}

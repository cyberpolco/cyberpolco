import type { PawaPayTransaction } from "@/lib/db/payments";
import { formatDateTime } from "@/lib/utils/date-format";
import PaymentStatusChip from "./PaymentStatusChip";

// "My payment history" for a Starlink client's site or an Academy student's
// enrollment — no name column, since it's already scoped to just this person.
export default function PaymentHistoryList({ transactions }: { transactions: PawaPayTransaction[] }) {
  if (transactions.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-black/15 dark:border-white/15 p-4 text-center text-sm text-brand-gray dark:text-white/60">
        No payment attempts yet.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">
        Payment history
      </p>
      <ul className="divide-y divide-black/5 dark:divide-white/10 rounded-xl border border-black/5 dark:border-white/10">
        {transactions.map((t) => (
          <li key={t.id} className="flex items-center justify-between gap-3 p-3 text-sm">
            <div>
              <p className="font-medium text-brand-dark dark:text-white">${t.amount}</p>
              <p className="text-xs text-brand-gray dark:text-white/60">{formatDateTime(t.createdAt)}</p>
            </div>
            <PaymentStatusChip status={t.status} />
          </li>
        ))}
      </ul>
    </div>
  );
}

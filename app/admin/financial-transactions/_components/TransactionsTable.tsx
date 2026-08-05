"use client";

import { useMemo, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { Download, Search, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "@/app/admin/_components/ConfirmDialog";
import PaymentStatusChip from "@/app/admin/_components/PaymentStatusChip";
import { formatDateTime } from "@/lib/utils/date-format";
import { reconcileTransactionAction } from "@/lib/actions/payments";

export type ResolvedTransaction = {
  id: string;
  pawapayId: string;
  type: string;
  status: string;
  amount: string;
  currency: string;
  payerMsisdn: string | null;
  referenceType: "starlink_subscription" | "academy_fee" | null;
  createdAt: string;
  personName: string;
  personType: "Starlink" | "Academy" | "Unlinked";
  productLabel: string;
};

type ProductFilter = "" | "Starlink" | "Academy" | "Unlinked";

function csvCell(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function downloadCsv(rows: ResolvedTransaction[]) {
  const header = ["Date", "Name", "Type", "Product", "Amount", "Currency", "Status", "Phone", "PawaPay ID"];
  const lines = [header, ...rows.map((t) => [
    formatDateTime(t.createdAt),
    t.personName,
    t.personType,
    t.productLabel,
    t.amount,
    t.currency,
    t.status,
    t.payerMsisdn ?? "",
    t.pawapayId,
  ])].map((row) => row.map(csvCell).join(","));

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `financial-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TransactionsTable({
  transactions,
  canReconcile,
}: {
  transactions: ResolvedTransaction[];
  canReconcile: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [product, setProduct] = useState<ProductFilter>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const statusOptions = useMemo(
    () => Array.from(new Set(transactions.map((t) => t.status))).sort(),
    [transactions]
  );

  const q = query.trim().toLowerCase();
  const filtered = transactions.filter((t) => {
    if (
      q &&
      !t.personName.toLowerCase().includes(q) &&
      !(t.payerMsisdn ?? "").toLowerCase().includes(q) &&
      !t.pawapayId.toLowerCase().includes(q)
    )
      return false;
    if (status && t.status !== status) return false;
    if (product && t.personType !== product) return false;
    if (from && t.createdAt < from) return false;
    if (to && t.createdAt > `${to}T23:59:59.999Z`) return false;
    return true;
  });

  const hasActiveFilters = q !== "" || status !== "" || product !== "" || from !== "" || to !== "";

  function clearFilters() {
    setQuery("");
    setStatus("");
    setProduct("");
    setFrom("");
    setTo("");
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray dark:text-white/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, phone, or ID..."
            className="w-full rounded-full border border-black/10 dark:border-white/15 py-2 pl-9 pr-4 text-sm dark:bg-white/5 dark:text-white"
          />
        </div>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 px-3 py-2 text-sm text-brand-dark dark:text-white outline-none focus:border-brand-blue"
        >
          <option value="">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          value={product}
          onChange={(e) => setProduct(e.target.value as ProductFilter)}
          className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 px-3 py-2 text-sm text-brand-dark dark:text-white outline-none focus:border-brand-blue"
        >
          <option value="">All products</option>
          <option value="Starlink">Starlink</option>
          <option value="Academy">Academy</option>
          <option value="Unlinked">Unlinked</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-brand-gray dark:text-white/60">
          From
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 px-2 py-1.5 text-sm text-brand-dark dark:text-white outline-none focus:border-brand-blue"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-brand-gray dark:text-white/60">
          To
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-black/10 dark:border-white/15 bg-white dark:bg-brand-dark-2 px-2 py-1.5 text-sm text-brand-dark dark:text-white outline-none focus:border-brand-blue"
          />
        </label>

        {hasActiveFilters && (
          <button type="button" onClick={clearFilters} className="text-sm font-medium text-brand-blue">
            Clear filters
          </button>
        )}

        <button
          type="button"
          onClick={() => downloadCsv(filtered)}
          className="ml-auto flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold text-brand-dark dark:text-white"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Phone</th>
                {canReconcile && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{formatDateTime(t.createdAt)}</td>
                  <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                    {t.personName}
                    <span className="ml-2 rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs font-semibold text-brand-blue">
                      {t.personType}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{t.productLabel}</td>
                  <td className="px-5 py-3 text-brand-dark dark:text-white">${t.amount}</td>
                  <td className="px-5 py-3">
                    <PaymentStatusChip status={t.status} />
                  </td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{t.payerMsisdn ?? "—"}</td>
                  {canReconcile && (
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-3">
                        <ReconcileButton pawapayId={t.pawapayId} outcome="COMPLETED" />
                        <ReconcileButton pawapayId={t.pawapayId} outcome="FAILED" />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={canReconcile ? 7 : 6} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                    {transactions.length === 0 ? "No transactions yet." : "No transactions match these filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function ReconcileButton({ pawapayId, outcome }: { pawapayId: string; outcome: "COMPLETED" | "FAILED" }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { push } = useToast();

  function handleConfirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("pawapayId", pawapayId);
      formData.set("outcome", outcome);
      try {
        await reconcileTransactionAction(formData);
        push(`Marked ${outcome === "COMPLETED" ? "completed" : "failed"}.`, { variant: "success" });
        setOpen(false);
      } catch (err) {
        unstable_rethrow(err);
        push("Something went wrong. Please try again.", { variant: "error" });
        setOpen(false);
      }
    });
  }

  const label = outcome === "COMPLETED" ? "Mark completed" : "Mark failed";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        title={label}
        className={outcome === "COMPLETED" ? "text-status-good" : "text-status-critical"}
      >
        {outcome === "COMPLETED" ? <Check size={16} /> : <X size={16} />}
      </button>
      {open && (
        <ConfirmDialog
          title={`${label}?`}
          body="This forces the same outcome a PawaPay webhook would have applied — use it only for a transaction stuck without a resolution."
          confirmLabel={label}
          pending={isPending}
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}

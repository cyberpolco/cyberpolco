import type { Receipt } from "@/lib/db/receipts";
import { formatDateTime } from "@/lib/utils/date-format";
import LessonMaterialViewer from "@/app/admin/academy/_components/LessonMaterialViewer";

// Read-only list of receipts for one Starlink site / Academy enrollment —
// used both by the staff/superadmin management pages (alongside
// ReceiptUploadForm) and, unmodified, by the client/student self-service
// pages (no upload capability there).
export default function ReceiptsList({ receipts }: { receipts: Receipt[] }) {
  if (receipts.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-black/15 dark:border-white/15 p-4 text-center text-sm text-brand-gray dark:text-white/60">
        No receipts yet.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">Receipts</p>
      <ul className="divide-y divide-black/5 dark:divide-white/10 rounded-xl border border-black/5 dark:border-white/10">
        {receipts.map((r) => (
          <li key={r.id} className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                {r.amount && (
                  <p className="text-sm font-medium text-brand-dark dark:text-white">
                    ${r.amount} {r.currency}
                  </p>
                )}
                <p className="text-xs text-brand-gray dark:text-white/60">{formatDateTime(r.createdAt)}</p>
              </div>
              <span
                className={
                  r.source === "auto_generated"
                    ? "rounded-full bg-status-good/15 px-2.5 py-0.5 text-xs font-semibold text-status-good"
                    : "rounded-full bg-brand-blue/15 px-2.5 py-0.5 text-xs font-semibold text-brand-blue"
                }
              >
                {r.source === "auto_generated" ? "Auto-generated" : "Uploaded"}
              </span>
            </div>
            <div className="mt-2">
              <LessonMaterialViewer materialUrl={r.fileUrl} materialFileName={r.fileName ?? "Receipt.pdf"} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

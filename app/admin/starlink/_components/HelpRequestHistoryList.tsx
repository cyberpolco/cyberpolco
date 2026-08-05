import type { StarlinkHelpHistoryEntry } from "@/lib/db/starlink";
import { formatDateTime } from "@/lib/utils/date-format";

export default function HelpRequestHistoryList({
  entries,
  resolvedByName,
}: {
  entries: StarlinkHelpHistoryEntry[];
  resolvedByName: Record<string, string>;
}) {
  if (entries.length === 0) {
    return (
      <p className="mt-4 rounded-xl border border-dashed border-black/15 dark:border-white/15 p-4 text-center text-sm text-brand-gray dark:text-white/60">
        No help requests resolved yet.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">
        Help request history
      </p>
      <ul className="divide-y divide-black/5 dark:divide-white/10 rounded-xl border border-black/5 dark:border-white/10">
        {entries.map((e) => {
          const resolver = e.resolvedBy ? resolvedByName[e.resolvedBy] : undefined;
          return (
            <li key={e.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <div>
                <p className="font-medium text-brand-dark dark:text-white">{e.siteName}</p>
                <p className="text-xs text-brand-gray dark:text-white/60">
                  Requested {formatDateTime(e.requestedAt)} · Resolved {formatDateTime(e.resolvedAt)}
                  {resolver ? ` by ${resolver}` : ""}
                </p>
              </div>
              <span className="rounded-full bg-status-good/10 px-2.5 py-1 text-xs font-semibold text-status-good">
                Resolved
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

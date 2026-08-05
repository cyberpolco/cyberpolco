"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Search } from "lucide-react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import HelpRequestBadge from "@/app/admin/starlink/_components/HelpRequestBadge";
import { deleteStarlinkClientAction } from "@/lib/actions/starlink";
import { isValidClientId, isValidKitClientId } from "@/lib/content/starlink-options";
import type { StarlinkClient } from "@/lib/db/starlink";

// Exact lengths of a fully-formed id in each format (STK-0001 / STK260154E18RE)
// — used to decide when a query has "enough" characters at a checkpoint to
// judge it invalid, rather than mid-way through typing the other format.
const CLIENT_ID_LENGTH = 8;
const KIT_CLIENT_ID_LENGTH = 14;

export default function StarlinkClientsTable({
  clients,
  pendingTargetIds,
  canDelete,
}: {
  clients: StarlinkClient[];
  pendingTargetIds: Set<string>;
  canDelete: boolean;
}) {
  const [query, setQuery] = useState("");

  const q = query.trim().toUpperCase();
  const matches = (c: StarlinkClient) =>
    c.clientId.toUpperCase().includes(q) || c.sites.some((s) => s.kitClientId?.toUpperCase().includes(q));
  const filtered = q ? clients.filter(matches) : clients;

  const isValid = isValidClientId(q) || isValidKitClientId(q);
  const looksComplete =
    q.length === CLIENT_ID_LENGTH || q.length === KIT_CLIENT_ID_LENGTH || q.length > KIT_CLIENT_ID_LENGTH;
  const showFormatHint = looksComplete && !isValid;

  return (
    <div>
      <div className="relative w-full max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray dark:text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Client ID or Site ID..."
          className="w-full rounded-full border border-black/10 dark:border-white/15 py-2 pl-9 pr-4 text-sm dark:bg-white/5 dark:text-white"
        />
      </div>
      {showFormatHint && (
        <p className="mt-1 text-xs text-brand-red">
          Doesn&apos;t match either format — Client ID: STK-NNNN (e.g. STK-0001) or Site ID: STKYYNNNNTDDSS (e.g.
          STK260154E18RE)
        </p>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Client ID</th>
                <th className="px-5 py-3">Sites</th>
                <th className="px-5 py-3">Site IDs</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const sitesNeedingHelp = c.sites.filter((s) => s.helpRequestedAt);

                return (
                <tr key={c.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                    {c.name}
                    {pendingTargetIds.has(c.id) && (
                      <span className="ml-2 rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-semibold text-status-warning">
                        Pending review
                      </span>
                    )}
                    <HelpRequestBadge clientId={c.id} sitesNeedingHelp={sitesNeedingHelp} />
                  </td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.clientId}</td>
                  <td className="px-5 py-3 text-brand-gray dark:text-white/60">{c.sites.length}</td>
                  <td className="px-5 py-3 font-mono text-xs text-brand-gray dark:text-white/60">
                    {c.sites.map((s) => s.kitClientId).filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3">
                      <Link href={`/admin/starlink/${c.id}/edit`} className="text-brand-blue">
                        <Pencil size={16} />
                      </Link>
                      {canDelete && (
                        <DeleteButton
                          action={deleteStarlinkClientAction}
                          id={c.id}
                          confirmTitle="Delete this client?"
                          confirmBody={`"${c.name}" and its sites will be permanently removed.`}
                        />
                      )}
                    </div>
                  </td>
                </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                    {clients.length === 0 ? "No Starlink clients yet." : "No clients or sites match that ID."}
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

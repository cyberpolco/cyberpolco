"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Search } from "lucide-react";
import DeleteButton from "@/app/admin/_components/DeleteButton";
import { deleteStarlinkClientAction } from "@/lib/actions/starlink";
import { isValidKitClientId } from "@/lib/content/starlink-options";
import type { StarlinkClient } from "@/lib/db/starlink";

// Length of a fully-formed STKYYNNNNTDDSS id — used to decide when a partial
// search query has "enough" characters to judge as invalid rather than just
// incomplete.
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
  const matchesSite = (c: StarlinkClient) => c.sites.some((s) => s.kitClientId?.toUpperCase().includes(q));
  const filtered = q ? clients.filter(matchesSite) : clients;
  const showFormatHint = q.length >= KIT_CLIENT_ID_LENGTH && !isValidKitClientId(q);

  return (
    <div>
      <div className="relative w-full max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray dark:text-white/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by site Client ID..."
          className="w-full rounded-full border border-black/10 dark:border-white/15 py-2 pl-9 pr-4 text-sm dark:bg-white/5 dark:text-white"
        />
      </div>
      {showFormatHint && (
        <p className="mt-1 text-xs text-brand-red">Doesn&apos;t match the Client ID format: STKYYNNNNTDDSS (e.g. STK260154E18RE)</p>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Client ID</th>
                <th className="px-5 py-3">Sites</th>
                <th className="px-5 py-3">Site Client IDs</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                    {c.name}
                    {pendingTargetIds.has(c.id) && (
                      <span className="ml-2 rounded-full bg-status-warning/15 px-2 py-0.5 text-xs font-semibold text-status-warning">
                        Pending review
                      </span>
                    )}
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
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                    {clients.length === 0 ? "No Starlink clients yet." : "No sites match that Client ID."}
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

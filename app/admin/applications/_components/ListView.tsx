"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import type { Application, Stage } from "@/lib/types/applications";
import { moveApplicationStageAction, deleteApplicationAction } from "@/lib/actions/applications";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/date-format";
import StageSelect from "./StageSelect";
import DeleteButton from "@/app/admin/_components/DeleteButton";

export default function ListView({
  applications,
  canDelete,
}: {
  applications: Application[];
  canDelete: boolean;
}) {
  const [items, setItems] = useState(applications);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const { push } = useToast();

  function moveRow(id: string, stage: Stage) {
    const prevStage = items.find((a) => a.id === id)?.stage;
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));
    setPendingIds((prev) => new Set(prev).add(id));

    startTransition(async () => {
      try {
        await moveApplicationStageAction(id, stage);
      } catch (err) {
        unstable_rethrow(err);
        if (prevStage) {
          setItems((prev) => prev.map((a) => (a.id === id ? { ...a, stage: prevStage } : a)));
        }
        push("Failed to update stage. Please try again.", { variant: "error" });
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
            <tr>
              <th className="px-5 py-3">Candidate</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Contact</th>
              <th className="px-5 py-3">CV</th>
              <th className="px-5 py-3">Stage</th>
              <th className="px-5 py-3">Received</th>
              {canDelete && <th className="px-5 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {items.map((app) => (
              <tr key={app.id} className="border-t border-black/5 dark:border-white/10 align-top">
                <td className="px-5 py-3 font-medium text-brand-dark dark:text-white">
                  <Link href={`/admin/applications/${app.id}`} className="hover:text-brand-blue">
                    {app.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">{app.jobTitle}</td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                  {app.email}
                  <br />
                  {app.phone}
                </td>
                <td className="px-5 py-3">
                  {app.cvUrl.startsWith("local-storage://") ? (
                    <span className="text-xs text-brand-gray dark:text-white/60">
                      {app.cvFileName} (local dev storage)
                    </span>
                  ) : (
                    <a
                      href={app.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-blue"
                    >
                      Download
                    </a>
                  )}
                </td>
                <td className="px-5 py-3">
                  <StageSelect
                    value={app.stage}
                    onChange={(stage) => moveRow(app.id, stage)}
                    disabled={pendingIds.has(app.id)}
                  />
                </td>
                <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                  {formatDate(app.createdAt)}
                </td>
                {canDelete && (
                  <td className="px-5 py-3 text-right">
                    <DeleteButton
                      action={deleteApplicationAction}
                      id={app.id}
                      confirmTitle="Delete this application?"
                      confirmBody={`"${app.name}"'s application for ${app.jobTitle} will be permanently removed.`}
                    />
                  </td>
                )}
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={canDelete ? 7 : 6} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

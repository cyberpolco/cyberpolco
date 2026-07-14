"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Application, Stage } from "@/lib/types/applications";
import { moveApplicationStageAction } from "@/lib/actions/applications";
import StageSelect from "./StageSelect";

export default function ListView({ applications }: { applications: Application[] }) {
  const [items, setItems] = useState(applications);
  const [, startTransition] = useTransition();

  function moveRow(id: string, stage: Stage) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));
    startTransition(() => {
      moveApplicationStageAction(id, stage);
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-dark-2/5 dark:bg-white/5 text-xs uppercase tracking-wide text-brand-gray dark:text-white/60">
          <tr>
            <th className="px-5 py-3">Candidate</th>
            <th className="px-5 py-3">Role</th>
            <th className="px-5 py-3">Contact</th>
            <th className="px-5 py-3">CV</th>
            <th className="px-5 py-3">Stage</th>
            <th className="px-5 py-3">Received</th>
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
                <StageSelect value={app.stage} onChange={(stage) => moveRow(app.id, stage)} />
              </td>
              <td className="px-5 py-3 text-brand-gray dark:text-white/60">
                {new Date(app.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="px-5 py-8 text-center text-brand-gray dark:text-white/60">
                No applications yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

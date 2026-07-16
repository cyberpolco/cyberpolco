"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import type { Application, Stage } from "@/lib/types/applications";
import StageSelect from "./StageSelect";

export default function ApplicationCard({
  application,
  isPending,
  onStageChange,
}: {
  application: Application;
  isPending?: boolean;
  onStageChange: (id: string, stage: Stage) => void;
}) {
  return (
    <div
      draggable={!isPending}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", application.id);
      }}
      className={`cursor-grab rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-3 text-sm shadow-sm active:cursor-grabbing ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <Link
        href={`/admin/applications/${application.id}`}
        className="font-semibold text-brand-dark dark:text-white hover:text-brand-blue"
      >
        {application.name}
      </Link>
      <p className="mt-0.5 text-xs text-brand-gray dark:text-white/60">{application.jobTitle}</p>
      {application.message && (
        <p className="mt-2 line-clamp-2 text-xs text-brand-gray dark:text-white/60">{application.message}</p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        {application.cvUrl.startsWith("local-storage://") ? (
          <span className="text-xs text-brand-gray dark:text-white/60">Local CV</span>
        ) : (
          <a
            href={application.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-blue"
          >
            <FileText size={14} /> CV
          </a>
        )}
        <StageSelect
          value={application.stage}
          onChange={(stage) => onStageChange(application.id, stage)}
          disabled={isPending}
        />
      </div>

      <p className="mt-2 text-[11px] text-brand-gray/70 dark:text-white/50">
        {new Date(application.createdAt).toLocaleDateString()}
      </p>
    </div>
  );
}

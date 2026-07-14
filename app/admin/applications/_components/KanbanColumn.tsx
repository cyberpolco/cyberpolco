"use client";

import type { Application, Stage } from "@/lib/types/applications";
import ApplicationCard from "./ApplicationCard";

export default function KanbanColumn({
  label,
  stage,
  applications,
  onDrop,
  onStageChange,
}: {
  label: string;
  stage: Stage;
  applications: Application[];
  onDrop: (id: string, stage: Stage) => void;
  onStageChange: (id: string, stage: Stage) => void;
}) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDrop(id, stage);
      }}
      className="flex w-64 shrink-0 flex-col rounded-2xl bg-brand-dark-2/5 dark:bg-white/5 p-3"
    >
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-brand-dark dark:text-white">{label}</h3>
        <span className="rounded-full bg-white dark:bg-brand-dark-2 px-2 py-0.5 text-xs font-medium text-brand-gray dark:text-white/60">
          {applications.length}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {applications.map((app) => (
          <ApplicationCard key={app.id} application={app} onStageChange={onStageChange} />
        ))}
        {applications.length === 0 && (
          <p className="rounded-xl border border-dashed border-black/10 dark:border-white/15 p-4 text-center text-xs text-brand-gray dark:text-white/60">
            No candidates
          </p>
        )}
      </div>
    </div>
  );
}

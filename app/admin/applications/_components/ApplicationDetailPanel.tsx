"use client";

import { useState, useTransition } from "react";
import type { Application, Stage } from "@/lib/types/applications";
import { moveApplicationStageAction } from "@/lib/actions/applications";
import StageSelect from "./StageSelect";
import NotesEditor from "./NotesEditor";

export default function ApplicationDetailPanel({ application }: { application: Application }) {
  const [stage, setStage] = useState(application.stage);
  const [, startTransition] = useTransition();

  function handleStageChange(next: Stage) {
    setStage(next);
    startTransition(() => {
      moveApplicationStageAction(application.id, next);
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Stage</label>
        <StageSelect value={stage} onChange={handleStageChange} />
      </div>
      <NotesEditor id={application.id} initialNotes={application.notes ?? ""} />
    </div>
  );
}

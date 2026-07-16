"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import type { Application, Stage } from "@/lib/types/applications";
import { moveApplicationStageAction } from "@/lib/actions/applications";
import { useToast } from "@/components/ui/toast";
import StageSelect from "./StageSelect";
import NotesEditor from "./NotesEditor";

export default function ApplicationDetailPanel({ application }: { application: Application }) {
  const [stage, setStage] = useState(application.stage);
  const [isPending, startTransition] = useTransition();
  const { push } = useToast();

  function handleStageChange(next: Stage) {
    const prevStage = stage;
    setStage(next);
    startTransition(async () => {
      try {
        await moveApplicationStageAction(application.id, next);
      } catch (err) {
        unstable_rethrow(err);
        setStage(prevStage);
        push("Failed to update stage. Please try again.", { variant: "error" });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Stage</label>
        <StageSelect value={stage} onChange={handleStageChange} disabled={isPending} />
      </div>
      <NotesEditor id={application.id} initialNotes={application.notes ?? ""} />
    </div>
  );
}

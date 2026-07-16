"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { STAGES, type Application, type Stage } from "@/lib/types/applications";
import { moveApplicationStageAction } from "@/lib/actions/applications";
import { useToast } from "@/components/ui/toast";
import KanbanColumn from "./KanbanColumn";

export default function KanbanBoard({ applications }: { applications: Application[] }) {
  const [items, setItems] = useState(applications);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const { push } = useToast();

  function moveCard(id: string, stage: Stage) {
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((s) => (
        <KanbanColumn
          key={s.value}
          label={s.label}
          stage={s.value}
          applications={items.filter((a) => a.stage === s.value)}
          pendingIds={pendingIds}
          onDrop={moveCard}
          onStageChange={moveCard}
        />
      ))}
    </div>
  );
}

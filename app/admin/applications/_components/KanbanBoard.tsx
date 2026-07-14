"use client";

import { useState, useTransition } from "react";
import { STAGES, type Application, type Stage } from "@/lib/db/applications";
import { moveApplicationStageAction } from "@/lib/actions/applications";
import KanbanColumn from "./KanbanColumn";

export default function KanbanBoard({ applications }: { applications: Application[] }) {
  const [items, setItems] = useState(applications);
  const [, startTransition] = useTransition();

  function moveCard(id: string, stage: Stage) {
    setItems((prev) => prev.map((a) => (a.id === id ? { ...a, stage } : a)));
    startTransition(() => {
      moveApplicationStageAction(id, stage);
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
          onDrop={moveCard}
          onStageChange={moveCard}
        />
      ))}
    </div>
  );
}

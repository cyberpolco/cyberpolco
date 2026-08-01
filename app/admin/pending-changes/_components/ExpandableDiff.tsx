"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { diffLines } from "@/lib/diff/lines";

function pretty(value: unknown): string {
  return value === undefined ? "—" : JSON.stringify(value, null, 2);
}

export default function ExpandableDiff({
  label,
  before,
  after,
}: {
  label: string;
  before: unknown;
  after: unknown;
}) {
  const [open, setOpen] = useState(false);

  const diff = diffLines(pretty(before).split("\n"), pretty(after).split("\n"));

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-brand-dark dark:text-white"
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        <span className="font-medium">{label}</span> changed — {open ? "hide" : "view"} details
      </button>

      {open && (
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">
              Current
            </p>
            <pre className="max-h-64 overflow-auto rounded-lg border border-black/10 dark:border-white/15 bg-black/5 dark:bg-white/5 p-3 text-xs text-brand-dark dark:text-white/80">
              {diff
                .filter((l) => l.type !== "added")
                .map((l, i) => (
                  <div
                    key={i}
                    className={l.type === "removed" ? "bg-status-warning/30 dark:bg-status-warning/20" : ""}
                  >
                    {l.text}
                  </div>
                ))}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand-gray dark:text-white/60">
              Proposed
            </p>
            <pre className="max-h-64 overflow-auto rounded-lg border border-brand-blue/30 bg-brand-blue/5 p-3 text-xs text-brand-dark dark:text-white/80">
              {diff
                .filter((l) => l.type !== "removed")
                .map((l, i) => (
                  <div
                    key={i}
                    className={l.type === "added" ? "bg-status-warning/30 dark:bg-status-warning/20" : ""}
                  >
                    {l.text}
                  </div>
                ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

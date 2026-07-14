"use client";

import { STAGES, type Stage } from "@/lib/types/applications";

export default function StageSelect({
  value,
  onChange,
  disabled,
}: {
  value: Stage;
  onChange: (stage: Stage) => void;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value as Stage)}
      className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs font-medium text-brand-dark outline-none focus:border-brand-blue disabled:opacity-60"
    >
      {STAGES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useState } from "react";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import type { TextAlign } from "@/lib/types/text-align";

const ALIGN_OPTIONS: { value: TextAlign; label: string; Icon: typeof AlignLeft }[] = [
  { value: "left", label: "Align left", Icon: AlignLeft },
  { value: "center", label: "Align center", Icon: AlignCenter },
  { value: "right", label: "Align right", Icon: AlignRight },
  { value: "justify", label: "Justify", Icon: AlignJustify },
];

export default function AlignedTextarea({
  name,
  alignName,
  defaultValue,
  defaultAlign = "left",
  rows = 4,
  required,
  className = "w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 dark:bg-white/5 dark:text-white",
}: {
  name: string;
  alignName: string;
  defaultValue?: string;
  defaultAlign?: TextAlign;
  rows?: number;
  required?: boolean;
  className?: string;
}) {
  const [align, setAlign] = useState<TextAlign>(defaultAlign);

  return (
    <div>
      <div className="mb-1.5 flex w-fit items-center gap-0.5 rounded-lg border border-black/10 dark:border-white/15 p-1">
        {ALIGN_OPTIONS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setAlign(value)}
            aria-label={label}
            aria-pressed={align === value}
            className={`rounded-md p-1.5 ${
              align === value
                ? "bg-brand-blue text-white"
                : "text-brand-gray hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
            }`}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
      <input type="hidden" name={alignName} value={align} />
      <textarea
        name={name}
        defaultValue={defaultValue}
        rows={rows}
        required={required}
        style={{ textAlign: align }}
        className={className}
      />
    </div>
  );
}

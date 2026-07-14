"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function RevealText({ value }: { value: string }) {
  const [visible, setVisible] = useState(false);

  return (
    <span className="inline-flex items-center gap-2">
      <span className="font-mono text-sm text-brand-dark dark:text-white">
        {visible ? value : "•".repeat(Math.min(value.length, 12) || 8)}
      </span>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide" : "Show"}
        className="text-brand-gray dark:text-white/60 hover:text-brand-dark dark:text-white"
      >
        {visible ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </span>
  );
}

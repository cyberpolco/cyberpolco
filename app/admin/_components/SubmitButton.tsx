"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

const VARIANT_CLASSES = {
  primary:
    "rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70",
  subtle:
    "rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:text-white dark:hover:bg-white/10",
  compact:
    "rounded-full border border-black/10 px-3 py-1 text-xs font-semibold text-brand-gray hover:border-brand-blue hover:text-brand-blue disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:text-white/60",
} as const;

export default function SubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  variant?: keyof typeof VARIANT_CLASSES;
  disabled?: boolean;
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`flex items-center justify-center gap-2 ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {pending ? pendingLabel ?? "Saving..." : children}
    </button>
  );
}

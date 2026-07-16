"use client";

import { Loader2 } from "lucide-react";

export default function SubmitButton({
  children,
  pendingLabel,
  pending,
  disabled = false,
  className = "",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  pending: boolean;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className={`flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {pending ? pendingLabel ?? "Submitting..." : children}
    </button>
  );
}

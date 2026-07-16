"use client";

import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import type { Toast } from "./types";

const VARIANT_STYLES: Record<
  Toast["variant"],
  { icon: typeof Info; iconClass: string; borderClass: string }
> = {
  info: { icon: Info, iconClass: "text-brand-blue", borderClass: "border-brand-blue/20" },
  success: {
    icon: CheckCircle2,
    iconClass: "text-status-good",
    borderClass: "border-status-good/20",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-status-critical",
    borderClass: "border-status-critical/20",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-status-warning",
    borderClass: "border-status-warning/30",
  },
};

export default function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const { icon: Icon, iconClass, borderClass } = VARIANT_STYLES[toast.variant];

  return (
    <div
      role="status"
      className={`fb-toast-enter ${
        toast.exiting ? "fb-toast-exit" : ""
      } pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border ${borderClass} bg-white p-4 shadow-lg dark:bg-brand-dark-2`}
    >
      <Icon size={18} className={`mt-0.5 shrink-0 ${iconClass}`} />
      <p className="flex-1 text-sm text-brand-dark dark:text-white">{toast.message}</p>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss"
        className="shrink-0 text-brand-gray hover:text-brand-dark dark:text-white/50 dark:hover:text-white"
      >
        <X size={16} />
      </button>
    </div>
  );
}

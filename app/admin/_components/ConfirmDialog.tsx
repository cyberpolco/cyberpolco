"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useHasMounted } from "@/components/ui/useHasMounted";

export default function ConfirmDialog({
  title,
  body,
  confirmLabel = "Delete",
  pending,
  onConfirm,
  onCancel,
}: {
  title: string;
  body?: string;
  confirmLabel?: string;
  pending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const mounted = useHasMounted();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onCancel]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div
        className="fb-dialog-overlay absolute inset-0 bg-black/50"
        onClick={onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="fb-dialog-panel relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-brand-dark-2"
      >
        <h2 id="confirm-dialog-title" className="text-base font-bold text-brand-dark dark:text-white">
          {title}
        </h2>
        {body && <p className="mt-2 text-sm text-brand-gray dark:text-white/60">{body}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-brand-dark disabled:opacity-50 dark:border-white/15 dark:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="flex items-center gap-2 rounded-full bg-brand-red px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
          >
            {pending && <Loader2 size={15} className="animate-spin" />}
            {pending ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

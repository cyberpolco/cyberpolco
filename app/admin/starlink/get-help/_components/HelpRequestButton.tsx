"use client";

import { useFormStatus } from "react-dom";
import { LifeBuoy, Loader2 } from "lucide-react";

// Must render inside the <form> it belongs to — useFormStatus reads the
// nearest ancestor form's pending state.
export default function HelpRequestButton() {
  const { pending } = useFormStatus();

  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      {!pending && <span className="absolute inset-0 animate-ping rounded-full bg-brand-red/40" />}
      <button
        type="submit"
        disabled={pending}
        className="relative flex h-40 w-40 flex-col items-center justify-center gap-2 rounded-full bg-brand-red text-white shadow-lg shadow-brand-red/30 transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-80"
      >
        {pending ? <Loader2 size={32} className="animate-spin" /> : <LifeBuoy size={32} />}
        <span className="px-4 text-center text-sm font-semibold leading-tight">
          {pending ? "Sending... / Envoi..." : "Get Help / Aide"}
        </span>
      </button>
    </div>
  );
}

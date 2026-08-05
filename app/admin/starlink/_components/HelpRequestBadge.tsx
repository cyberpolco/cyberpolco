"use client";

import { useEffect, useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { AlertTriangle, Check, X } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { resolveTechnicianHelpAction } from "@/lib/actions/starlink";
import type { StarlinkSite } from "@/lib/db/starlink";

// Rendered unconditionally by the parent (not gated on sitesNeedingHelp.length)
// so this component stays mounted across the revalidatePath refresh that
// follows a resolve — otherwise the parent's fresh, empty sitesNeedingHelp
// would unmount it before the green "Resolved" state ever became visible.
export default function HelpRequestBadge({
  clientId,
  sitesNeedingHelp,
}: {
  clientId: string;
  sitesNeedingHelp: StarlinkSite[];
}) {
  const [isPending, startTransition] = useTransition();
  const [justResolved, setJustResolved] = useState(false);
  const { push } = useToast();

  useEffect(() => {
    if (!justResolved) return;
    const timer = setTimeout(() => setJustResolved(false), 2500);
    return () => clearTimeout(timer);
  }, [justResolved]);

  if (sitesNeedingHelp.length === 0 && !justResolved) return null;

  function handleResolve() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("id", clientId);
      try {
        await resolveTechnicianHelpAction(formData);
        setJustResolved(true);
        push("Help request marked resolved.", { variant: "success" });
      } catch (err) {
        unstable_rethrow(err);
        push("Something went wrong. Please try again.", { variant: "error" });
      }
    });
  }

  if (justResolved) {
    return (
      <span className="fb-toast-enter ml-2 inline-flex items-center gap-1.5 rounded-full bg-status-good/15 px-2.5 py-1 align-middle text-sm font-bold text-status-good">
        <Check size={16} /> Resolved
      </span>
    );
  }

  const tooltip = `Urgent help needed by the customer: ${sitesNeedingHelp.map((s) => s.siteName).join(", ")}`;

  return (
    <div className="ml-2 inline-flex items-center gap-2 rounded-full bg-status-critical/15 pl-2.5 pr-1.5 py-1 align-middle">
      <span title={tooltip} aria-label={tooltip} className="inline-flex items-center gap-1.5 text-sm font-bold text-status-critical">
        <AlertTriangle size={20} />
        {sitesNeedingHelp.length}
      </span>
      <button
        type="button"
        onClick={handleResolve}
        disabled={isPending}
        title="Mark this help request resolved"
        className="flex items-center gap-1 rounded-full bg-status-critical px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-red disabled:opacity-60"
      >
        <X size={14} /> {isPending ? "Resolving..." : "Resolve"}
      </button>
    </div>
  );
}

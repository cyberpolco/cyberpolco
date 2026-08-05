"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { unstable_rethrow } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "./ConfirmDialog";

// Deposits that haven't reached a final state yet — see lib/pawapay/client.ts.
const IN_FLIGHT_STATUSES = new Set(["PENDING", "ACCEPTED", "PROCESSING", "IN_RECONCILIATION"]);

// Polling interval for the status-poll fallback (see e.g.
// refreshStarlinkDepositStatusAction/refreshAcademyDepositStatusAction) —
// only matters when PawaPay's webhook can't reach this server (e.g. local
// dev with no public HTTPS URL).
const POLL_INTERVAL_MS = 4000;

const DEFAULT_TRIGGER_CLASS =
  "mt-4 w-full rounded-full border border-black/10 px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-black/5 dark:border-white/15 dark:text-white dark:hover:bg-white/10";

// Shared by the Starlink subscription renewal and Academy enrollment fee
// flows — both are "self-service, click Pay, confirm a mobile money number"
// with the same PawaPay deposit + poll/webhook reconciliation shape (see
// lib/pawapay/reconcile.ts). fieldName/fieldValue is the one thing that
// differs (siteId vs enrollmentId).
export default function PayWithMobileMoneyButton({
  fieldName,
  fieldValue,
  priceLabel,
  defaultPhone,
  pendingDeposit,
  action,
  refreshAction,
  triggerClassName = DEFAULT_TRIGGER_CLASS,
}: {
  fieldName: string;
  fieldValue: string;
  priceLabel: string;
  defaultPhone: string;
  pendingDeposit: { pawapayId: string; status: string } | null;
  action: (formData: FormData) => Promise<void>;
  refreshAction: (pawapayId: string) => Promise<{ status: string }>;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(defaultPhone);
  const [isPending, startTransition] = useTransition();
  const { push } = useToast();
  const router = useRouter();

  const showPending = !!pendingDeposit && IN_FLIGHT_STATUSES.has(pendingDeposit.status);

  // Polls the fallback status check on an interval rather than relying only
  // on the webhook — clearInterval stops it as soon as this closure sees a
  // final status, independently of whether/when the resulting
  // router.refresh() delivers a fresh pendingDeposit prop back down.
  useEffect(() => {
    if (!showPending || !pendingDeposit) return;
    const interval = setInterval(async () => {
      const { status } = await refreshAction(pendingDeposit.pawapayId);
      if (status === "COMPLETED" || status === "FAILED") {
        clearInterval(interval);
        router.refresh();
        push(status === "COMPLETED" ? "Payment confirmed!" : "Payment failed — you can try again.", {
          variant: status === "COMPLETED" ? "success" : "error",
        });
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [showPending, pendingDeposit, refreshAction, router, push]);

  function handleConfirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set(fieldName, fieldValue);
      formData.set("phoneNumber", phone);
      try {
        await action(formData);
        setOpen(false);
        router.refresh();
        push("Payment request sent — check your phone to approve.", { variant: "success" });
      } catch (err) {
        unstable_rethrow(err);
        push(err instanceof Error ? err.message : "Something went wrong. Please try again.", { variant: "error" });
      }
    });
  }

  if (showPending) {
    return (
      <div className="mt-4 flex items-center justify-center gap-2 rounded-full border border-dashed border-black/15 px-4 py-2 text-sm text-brand-gray dark:border-white/15 dark:text-white/60">
        <Loader2 size={14} className="animate-spin" />
        Awaiting approval on your phone…
      </div>
    );
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {`Pay ${priceLabel}`}
      </button>
      {open && (
        <ConfirmDialog
          title="Confirm mobile money payment"
          body={`We'll send a payment request for ${priceLabel} to this number.`}
          confirmLabel="Send request"
          pending={isPending}
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        >
          <label className="mt-4 block text-sm">
            <span className="text-brand-gray dark:text-white/60">Mobile money number</span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+243991234567"
              disabled={isPending}
              className="mt-1 w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 text-sm text-brand-dark disabled:opacity-50 dark:border-white/15 dark:text-white"
            />
          </label>
        </ConfirmDialog>
      )}
    </>
  );
}

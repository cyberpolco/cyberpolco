"use client";

import { useState } from "react";
import PayWithMobileMoneyButton from "@/app/admin/_components/PayWithMobileMoneyButton";
import { LEARNING_MODE_LABELS, CLASSROOM_TIMETABLE_NOTE } from "@/lib/academy/pricing";
import { formatUsdCents } from "@/lib/content/money";
import type { LearningMode } from "@/lib/db/academy";

// The locked-course paywall: the student picks one of the course's priced
// learning modes, then pays that price through the shared mobile money
// button. The chosen mode travels as a form field and is re-validated
// against the course's prices server-side (initiateAcademyDepositAction).
export default function LearningModePayment({
  enrollmentId,
  options,
  initialMode,
  defaultPhone,
  pendingDeposit,
  paymentInFlight,
  action,
  refreshAction,
}: {
  enrollmentId: string;
  options: { mode: LearningMode; feeCents: number }[];
  initialMode: LearningMode | null;
  defaultPhone: string;
  pendingDeposit: { pawapayId: string; status: string } | null;
  // While a deposit awaits approval the mode it was started with is locked
  // in — see the matching server-side check.
  paymentInFlight: boolean;
  action: (formData: FormData) => Promise<{ ok: true } | { ok: false; message: string }>;
  refreshAction: (pawapayId: string) => Promise<{ status: string }>;
}) {
  const [mode, setMode] = useState<LearningMode>(
    options.find((o) => o.mode === initialMode)?.mode ?? options[0].mode
  );
  const selected = options.find((o) => o.mode === mode) ?? options[0];

  return (
    <div className="w-full">
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => (
          <label
            key={o.mode}
            className={`flex cursor-pointer flex-col rounded-xl border p-4 text-sm transition-colors ${
              o.mode === mode
                ? "border-brand-blue bg-brand-blue/5"
                : "border-black/10 dark:border-white/15"
            } ${paymentInFlight ? "cursor-not-allowed opacity-60" : ""}`}
          >
            <span className="flex items-center gap-2 font-medium text-brand-dark dark:text-white">
              <input
                type="radio"
                name="learningMode"
                value={o.mode}
                checked={o.mode === mode}
                disabled={paymentInFlight}
                onChange={() => setMode(o.mode)}
                className="accent-brand-blue"
              />
              {LEARNING_MODE_LABELS[o.mode]}
            </span>
            <span className="mt-1 text-lg font-bold text-brand-dark dark:text-white">{formatUsdCents(o.feeCents)}</span>
            {o.mode === "classroom" && (
              <span className="mt-1 text-xs text-brand-gray dark:text-white/60">{CLASSROOM_TIMETABLE_NOTE}</span>
            )}
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <PayWithMobileMoneyButton
          fieldName="enrollmentId"
          fieldValue={enrollmentId}
          extraFields={{ learningMode: selected.mode }}
          priceLabel={formatUsdCents(selected.feeCents)}
          defaultPhone={defaultPhone}
          pendingDeposit={pendingDeposit}
          action={action}
          refreshAction={refreshAction}
          triggerClassName="mt-4 flex items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
        />
      </div>
    </div>
  );
}

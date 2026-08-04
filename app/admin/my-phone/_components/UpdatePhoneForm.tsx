"use client";

import SubmitButton from "@/app/admin/_components/SubmitButton";
import { updatePhoneAction } from "@/lib/actions/technician";

const ERROR_MESSAGES: Record<string, string> = {
  "country-code": "Country code must be 1 to 3 digits.",
  "local-number": "Enter the 9-digit number without the leading 0, e.g. 991234567.",
  cooldown: "You can only update your phone number once every 5 days.",
};

export default function UpdatePhoneForm({ error, success }: { error?: string; success?: string }) {
  return (
    <form
      action={updatePhoneAction}
      className="mt-6 max-w-sm space-y-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6"
    >
      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Country code</label>
        <div className="flex items-center gap-2">
          <span className="text-brand-gray dark:text-white/60">+</span>
          <input
            type="text"
            name="countryCode"
            defaultValue="243"
            required
            inputMode="numeric"
            className="w-24 rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 outline-none focus:border-brand-blue dark:bg-white/5 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Phone number</label>
        <input
          type="text"
          name="localNumber"
          placeholder="991234567"
          required
          inputMode="numeric"
          className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 outline-none focus:border-brand-blue dark:bg-white/5 dark:text-white"
        />
        <p className="mt-1 text-xs text-brand-gray dark:text-white/60">9 digits, without the leading 0.</p>
      </div>

      {error && ERROR_MESSAGES[error] && <p className="text-sm text-brand-red">{ERROR_MESSAGES[error]}</p>}
      {success && <p className="text-sm text-emerald-600">Phone number updated.</p>}

      <SubmitButton pendingLabel="Saving...">Save phone number</SubmitButton>
    </form>
  );
}

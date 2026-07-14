"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";

export default function ResetLinkedPasswordButton({ linkedId }: { linkedId: string }) {
  const [password, setPassword] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    if (
      !confirm(
        "Generate a new temporary password for this account's dashboard login? The old password will stop working immediately."
      )
    ) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reset-linked-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ linkedId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }
      setPassword(data.password);
    } catch {
      setError("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-brand-dark dark:text-white">Login password</p>
          <p className="text-xs text-brand-gray dark:text-white/60">Resets this account&apos;s dashboard login password.</p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-semibold text-brand-dark dark:text-white hover:bg-black/5 dark:bg-white/10 disabled:opacity-50"
        >
          <KeyRound size={15} /> {loading ? "Resetting…" : "Reset password"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-brand-red">{error}</p>}

      {password && (
        <div className="mt-3 rounded-lg bg-brand-yellow/10 p-3 text-sm">
          <p className="font-medium text-brand-dark dark:text-white">New temporary password (shown once):</p>
          <p className="mt-1 font-mono text-brand-dark dark:text-white">{password}</p>
          <p className="mt-1 text-xs text-brand-gray dark:text-white/60">
            Share this with the user now — it won&apos;t be shown again. They&apos;ll be required
            to change it on next login.
          </p>
        </div>
      )}
    </div>
  );
}

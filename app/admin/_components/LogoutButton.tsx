"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <button
      type="submit"
      onClick={() => setLoading(true)}
      disabled={loading}
      className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-brand-gray hover:bg-brand-red/10 hover:text-brand-red disabled:opacity-60 dark:text-white/60 dark:hover:bg-brand-red/20 dark:hover:text-white"
    >
      {loading ? <Loader2 size={18} className="animate-spin" /> : <LogOut size={18} />}
      {loading ? "Logging out..." : "Log out"}
    </button>
  );
}

"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export default function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending && <Loader2 size={16} className="animate-spin" />}
      {pending ? "Signing in..." : "Sign in"}
    </button>
  );
}

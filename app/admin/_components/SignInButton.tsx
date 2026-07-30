"use client";

import SubmitButton from "./SubmitButton";

export default function SignInButton({
  label = "Sign in",
  pendingLabel = "Signing in...",
}: {
  label?: string;
  pendingLabel?: string;
}) {
  return (
    <SubmitButton pendingLabel={pendingLabel} className="w-full">
      {label}
    </SubmitButton>
  );
}

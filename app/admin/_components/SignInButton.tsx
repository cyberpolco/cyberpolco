"use client";

import SubmitButton from "./SubmitButton";

export default function SignInButton() {
  return (
    <SubmitButton pendingLabel="Signing in..." className="w-full">
      Sign in
    </SubmitButton>
  );
}

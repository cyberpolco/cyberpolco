"use client";

import { useState } from "react";
import PortalRoleTabs from "./PortalRoleTabs";
import PasswordField from "./PasswordField";
import SignInButton from "./SignInButton";
import ErrorToast from "./ErrorToast";

type RoleContent = { subtitle: string; identifierLabel: string; errorInvalid: string; errorFormat: string };

export default function LoginCard({
  loginAction,
  error,
  errorMessages,
  roleLabels,
  roleContent,
  password,
  showPassword,
  hidePassword,
  signIn,
  signingIn,
}: {
  loginAction: (formData: FormData) => void;
  error?: string;
  errorMessages: { config?: string; "rate-limit"?: string };
  roleLabels: [string, string, string];
  roleContent: [RoleContent, RoleContent, RoleContent];
  password: string;
  showPassword: string;
  hidePassword: string;
  signIn: string;
  signingIn: string;
}) {
  const [role, setRole] = useState(0);
  const content = roleContent[role];
  const errorMessage =
    error === "invalid"
      ? content.errorInvalid
      : error === "format"
        ? content.errorFormat
        : errorMessages[error as "config" | "rate-limit"];

  return (
    <>
      <p className="mt-1 text-center text-sm text-brand-gray">{content.subtitle}</p>

      <PortalRoleTabs
        adminLabel={roleLabels[0]}
        clientLabel={roleLabels[1]}
        studentLabel={roleLabels[2]}
        active={role}
        onChange={setRole}
      />

      <form action={loginAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-identifier" className="mb-1 block text-sm font-medium text-brand-dark">
            {content.identifierLabel}
          </label>
          <input
            id="login-identifier"
            type="text"
            name="identifier"
            autoComplete="username"
            required
            className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
          />
        </div>
        <PasswordField label={password} showLabel={showPassword} hideLabel={hidePassword} />

        {error && errorMessage && <p className="text-sm text-brand-red">{errorMessage}</p>}
        <ErrorToast message={error ? errorMessage : undefined} />

        <SignInButton label={signIn} pendingLabel={signingIn} />
      </form>
    </>
  );
}

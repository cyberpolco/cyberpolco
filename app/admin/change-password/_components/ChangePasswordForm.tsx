import PasswordField from "@/app/admin/_components/PasswordField";
import { changePasswordAction } from "@/lib/actions/auth";

export default function ChangePasswordForm({ error }: { error?: string }) {
  return (
    <form action={changePasswordAction} className="space-y-4">
      <PasswordField
        name="currentPassword"
        label="Current (temporary) password"
        autoComplete="current-password"
      />
      <PasswordField name="newPassword" label="New password" autoComplete="new-password" />
      <PasswordField
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
      />

      {error === "current" && (
        <p className="text-sm text-brand-red">Current password is incorrect.</p>
      )}
      {error === "length" && (
        <p className="text-sm text-brand-red">New password must be at least 10 characters.</p>
      )}
      {error === "mismatch" && (
        <p className="text-sm text-brand-red">New password and confirmation don&apos;t match.</p>
      )}

      <button
        type="submit"
        className="w-full rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
      >
        Change password
      </button>
    </form>
  );
}

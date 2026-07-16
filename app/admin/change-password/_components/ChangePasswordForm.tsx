import PasswordField from "@/app/admin/_components/PasswordField";
import SubmitButton from "@/app/admin/_components/SubmitButton";
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

      <SubmitButton pendingLabel="Changing password..." className="w-full">
        Change password
      </SubmitButton>
    </form>
  );
}

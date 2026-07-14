import PasswordField from "@/app/admin/_components/PasswordField";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
import { ROLES, ROLE_LABELS } from "@/lib/auth/roles";
import type { User } from "@/lib/db/users";

const ERROR_MESSAGES: Record<string, string> = {
  length: "Temporary password must be at least 10 characters.",
  duplicate: "A user with that email already exists.",
  "last-super-admin": "You can't remove the last remaining Super Admin.",
};

export default function UserForm({ user, error }: { user?: User; error?: string }) {
  const action = user ? updateUserAction : createUserAction;

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-black/5 bg-white p-6">
      {user && <input type="hidden" name="id" value={user.id} />}

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">Email</label>
        <input
          type="email"
          name="email"
          defaultValue={user?.email}
          required
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark">Role</label>
        <select
          name="role"
          defaultValue={user?.role ?? "viewer"}
          className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </select>
      </div>

      <PasswordField
        name="tempPassword"
        label={user ? "Set new temporary password" : "Temporary password"}
        required={!user}
        hint={
          user
            ? "Leave blank to keep the current password. Setting one forces a password change on next login."
            : "The user must change this password the first time they log in."
        }
      />

      {error && ERROR_MESSAGES[error] && (
        <p className="text-sm text-brand-red">{ERROR_MESSAGES[error]}</p>
      )}

      <button
        type="submit"
        className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
      >
        {user ? "Save changes" : "Create user"}
      </button>
    </form>
  );
}

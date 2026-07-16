import PasswordField from "@/app/admin/_components/PasswordField";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import ViewerLinkFields from "@/app/admin/users/_components/ViewerLinkFields";
import { createUserAction, updateUserAction } from "@/lib/actions/users";
import type { User } from "@/lib/db/users";
import type { StarlinkClient } from "@/lib/db/starlink";
import type { AcademyEnrollment } from "@/lib/db/academy";

const ERROR_MESSAGES: Record<string, string> = {
  length: "Temporary password must be at least 10 characters.",
  duplicate: "A user with that email already exists.",
  "last-super-admin": "You can't remove the last remaining Super Admin.",
  "viewer-link": "Select a viewer type and a linked record.",
};

export default function UserForm({
  user,
  error,
  starlinkClients,
  academyEnrollments,
}: {
  user?: User;
  error?: string;
  starlinkClients: StarlinkClient[];
  academyEnrollments: AcademyEnrollment[];
}) {
  const action = user ? updateUserAction : createUserAction;

  return (
    <form action={action} className="space-y-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-6">
      {user && <input type="hidden" name="id" value={user.id} />}

      <div>
        <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Email</label>
        <input
          type="email"
          name="email"
          defaultValue={user?.email}
          required
          className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 outline-none focus:border-brand-blue dark:bg-white/5 dark:text-white"
        />
      </div>

      <ViewerLinkFields
        defaultRole={user?.role ?? "viewer"}
        defaultViewerType={user?.viewerType}
        defaultLinkedId={user?.linkedId}
        starlinkClients={starlinkClients}
        academyEnrollments={academyEnrollments}
      />

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

      <SubmitButton pendingLabel={user ? "Saving..." : "Creating..."}>
        {user ? "Save changes" : "Create user"}
      </SubmitButton>
    </form>
  );
}

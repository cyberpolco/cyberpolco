import { requireRole } from "@/lib/auth/rbac";
import TeamMemberForm from "@/app/admin/cms/team/_components/TeamMemberForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function NewTeamMemberPage() {
  await requireRole(["super_admin", "content_editor"]);

  return (
    <div>
      <BackLink href="/admin/cms/team" label="Back to Team" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">New team member</h1>
      <div className="mt-6">
        <TeamMemberForm />
      </div>
    </div>
  );
}

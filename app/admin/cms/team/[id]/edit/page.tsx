import { notFound } from "next/navigation";
import { getTeamMemberById } from "@/lib/db/team";
import { requireRole } from "@/lib/auth/rbac";
import TeamMemberForm from "@/app/admin/cms/team/_components/TeamMemberForm";
import BackLink from "@/app/admin/_components/BackLink";

const ERROR_MESSAGES: Record<string, string> = {
  "file-type": "Photo must be a JPEG, PNG, or WEBP file.",
  "file-size": "Photo must be under 5MB.",
};

export default async function EditTeamMemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["super_admin", "content_editor"]);

  const { id } = await params;
  const { error } = await searchParams;
  const member = await getTeamMemberById(id);
  if (!member) notFound();

  return (
    <div>
      <BackLink href="/admin/cms/team" label="Back to Team" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Edit team member</h1>
      {error && ERROR_MESSAGES[error] && (
        <p className="mt-2 text-sm text-brand-red">{ERROR_MESSAGES[error]}</p>
      )}
      <div className="mt-6">
        <TeamMemberForm member={member} />
      </div>
    </div>
  );
}

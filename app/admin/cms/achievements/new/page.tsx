import { requireRole } from "@/lib/auth/rbac";
import AchievementForm from "@/app/admin/cms/achievements/_components/AchievementForm";
import BackLink from "@/app/admin/_components/BackLink";

const ERROR_MESSAGES: Record<string, string> = {
  "file-type": "Photo must be a JPEG, PNG, or WEBP file.",
  "file-size": "Photo must be under 5MB.",
};

export default async function NewAchievementPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await requireRole(["super_admin", "content_editor"]);
  const { error } = await searchParams;

  return (
    <div>
      <BackLink href="/admin/cms/achievements" label="Back to Achievements" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">New achievement</h1>
      {error && ERROR_MESSAGES[error] && (
        <p className="mt-2 text-sm text-brand-red">{ERROR_MESSAGES[error]}</p>
      )}
      <div className="mt-6">
        <AchievementForm />
      </div>
    </div>
  );
}

import { requireRole } from "@/lib/auth/rbac";
import AchievementForm from "@/app/admin/cms/achievements/_components/AchievementForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function NewAchievementPage() {
  await requireRole(["super_admin", "content_editor"]);

  return (
    <div>
      <BackLink href="/admin/cms/achievements" label="Back to Achievements" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">New achievement</h1>
      <div className="mt-6">
        <AchievementForm />
      </div>
    </div>
  );
}

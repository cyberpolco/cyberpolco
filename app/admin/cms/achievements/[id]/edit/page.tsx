import { notFound } from "next/navigation";
import { getAchievementById } from "@/lib/db/achievements";
import { requireRole } from "@/lib/auth/rbac";
import AchievementForm from "@/app/admin/cms/achievements/_components/AchievementForm";
import BackLink from "@/app/admin/_components/BackLink";

export default async function EditAchievementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole(["super_admin", "content_editor"]);

  const { id } = await params;
  const achievement = await getAchievementById(id);
  if (!achievement) notFound();

  return (
    <div>
      <BackLink href="/admin/cms/achievements" label="Back to Achievements" />

      <h1 className="mt-4 text-2xl font-bold text-brand-dark dark:text-white">Edit achievement</h1>
      <div className="mt-6">
        <AchievementForm achievement={achievement} />
      </div>
    </div>
  );
}

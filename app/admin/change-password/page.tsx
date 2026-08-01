import AuthPageBackground from "@/app/admin/_components/AuthPageBackground";
import ChangePasswordForm from "./_components/ChangePasswordForm";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <AuthPageBackground homeLabel="Home">
      <h1 className="font-display text-xl font-bold text-brand-dark">Set a new password</h1>
      <p className="mt-1 text-sm text-brand-gray">
        This account has a temporary password — choose a new one to continue.
      </p>

      <div className="mt-6">
        <ChangePasswordForm error={error} />
      </div>
    </AuthPageBackground>
  );
}

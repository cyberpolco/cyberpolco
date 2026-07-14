import ChangePasswordForm from "./_components/ChangePasswordForm";

export default async function ChangePasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-brand-dark-2 p-8 shadow-xl">
        <h1 className="font-display text-xl font-bold text-brand-dark dark:text-white">Set a new password</h1>
        <p className="mt-1 text-sm text-brand-gray dark:text-white/60">
          This account has a temporary password — choose a new one to continue.
        </p>

        <div className="mt-6">
          <ChangePasswordForm error={error} />
        </div>
      </div>
    </div>
  );
}

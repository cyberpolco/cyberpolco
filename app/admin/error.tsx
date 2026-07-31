"use client";

export default function AdminErrorBoundary({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">Error</p>
      <h1 className="mt-3 text-2xl font-bold text-brand-dark dark:text-white">Something went wrong</h1>
      <p className="mt-3 text-sm text-brand-gray dark:text-white/60">
        Please check your inputs and try again. If the problem persists, contact a super admin.
      </p>
      <button
        onClick={() => unstable_retry()}
        className="mt-6 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
      >
        Try again
      </button>
    </div>
  );
}

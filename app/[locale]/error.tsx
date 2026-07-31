"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ErrorBoundary({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const locale = useLocale() as "fr" | "en";

  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">
        {locale === "fr" ? "Erreur" : "Error"}
      </p>
      <h1 className="mt-3 text-4xl font-bold text-brand-dark">
        {locale === "fr" ? "Une erreur est survenue" : "Something went wrong"}
      </h1>
      <p className="mt-4 text-brand-gray">
        {locale === "fr"
          ? "Veuillez réessayer. Si le problème persiste, contactez-nous."
          : "Please try again. If the problem persists, get in touch with us."}
      </p>
      <div className="mt-8 flex justify-center gap-4">
        <button
          onClick={() => unstable_retry()}
          className="rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
        >
          {locale === "fr" ? "Réessayer" : "Try again"}
        </button>
        <Link
          href="/"
          className="rounded-full border border-black/10 px-6 py-3 text-sm font-semibold text-brand-dark"
        >
          {locale === "fr" ? "Accueil" : "Home"}
        </Link>
      </div>
    </div>
  );
}

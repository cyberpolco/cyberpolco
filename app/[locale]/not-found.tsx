import { getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const locale = (await getLocale()) as "fr" | "en";

  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-red">404</p>
      <h1 className="mt-3 text-4xl font-bold text-brand-dark">
        {locale === "fr" ? "Page introuvable" : "Page not found"}
      </h1>
      <p className="mt-4 text-brand-gray">
        {locale === "fr"
          ? "La page que vous recherchez n'existe pas ou a été déplacée."
          : "The page you're looking for doesn't exist or has been moved."}
      </p>
      <Link
        href="/"
        className="mt-8 inline-block rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
      >
        {locale === "fr" ? "Retour à l'accueil" : "Back to home"}
      </Link>
    </div>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import { getServiceBySlug } from "@/lib/db/services";
import { SERVICE_ICONS } from "@/lib/content/service-icons";
import { notFound } from "next/navigation";

export default async function ServiceDetail({
  slug,
  locale,
}: {
  slug: string;
  locale: "fr" | "en";
}) {
  const service = await getServiceBySlug(slug);
  if (!service) notFound();

  const t = await getTranslations("services");
  const content = service[locale];
  const Icon = SERVICE_ICONS[service.icon];

  return (
    <div className="mx-auto max-w-4xl px-5 py-20 lg:px-8">
      <Link href="/services" className="text-sm font-semibold text-brand-red">
        ← {t("title")}
      </Link>

      <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue">
        <Icon size={28} />
      </div>

      <h1 className="mt-6 text-4xl font-bold text-brand-dark">{content.name}</h1>
      <p className="mt-3 text-xl text-brand-gray">{content.tagline}</p>
      <p
        className="mt-6 text-base leading-relaxed text-brand-gray"
        style={{ textAlign: content.descriptionAlign || "left" }}
      >
        {content.description}
      </p>

      <ul className="mt-8 space-y-3">
        {content.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 shrink-0 text-brand-blue" size={20} />
            <span className="text-brand-dark">{bullet}</span>
          </li>
        ))}
      </ul>

      <div className="mt-10 rounded-2xl bg-brand-dark-2 p-8 text-white">
        <p className="text-lg font-semibold">
          {locale === "fr"
            ? "Parlons de votre besoin."
            : "Let's talk about what you need."}
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-block rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
        >
          {locale === "fr" ? "Contactez notre équipe" : "Contact our team"}
        </Link>
      </div>
    </div>
  );
}

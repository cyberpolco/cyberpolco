import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail, Phone, MapPin } from "lucide-react";
import ContactForm from "@/components/forms/ContactForm";
import { contactEmails } from "@/lib/content/company";
import { getSettings } from "@/lib/db/settings";
import { getBlock } from "@/lib/content/blocks";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: "fr" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const { socialLinks, offices } = await getSettings();
  const intro = await getBlock("contact.intro", locale);

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 lg:px-8">
      <div className="max-w-2xl">
        <h1 className="text-4xl font-bold text-brand-dark">{t("title")}</h1>
        <p className="mt-3 text-lg text-brand-gray">{intro.subtitle}</p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-black/5 p-7">
          <ContactForm />
        </div>

        <div className="space-y-8">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-dark">
              {t("officeTitle")}
            </h2>
            <div className="mt-4 space-y-4">
              {offices.map((o) => (
                <div key={o.country} className="text-sm text-brand-gray">
                  <p className="flex items-center gap-2 font-medium text-brand-dark">
                    <MapPin size={15} /> {o[locale].label}
                  </p>
                  <p className="mt-1 flex items-center gap-2">
                    <Phone size={15} /> {o.phone}
                  </p>
                  <a
                    href={o.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-brand-blue hover:underline"
                  >
                    {t("whatsappTitle")} →
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-dark">
              {t("emailTitle")}
            </h2>
            <a
              href={`mailto:${contactEmails.info}`}
              className="mt-2 flex items-center gap-2 text-sm text-brand-blue hover:underline"
            >
              <Mail size={15} /> {contactEmails.info}
            </a>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-dark">
              {t("socialTitle")}
            </h2>
            <ul className="mt-2 space-y-1 text-sm">
              <li><a href={socialLinks.linkedin} className="text-brand-blue hover:underline">LinkedIn</a></li>
              <li><a href={socialLinks.x} className="text-brand-blue hover:underline">X (Twitter)</a></li>
              <li><a href={socialLinks.tiktok} className="text-brand-blue hover:underline">TikTok</a></li>
              <li><a href={socialLinks.youtube} className="text-brand-blue hover:underline">YouTube</a></li>
              <li><a href={socialLinks.github} className="text-brand-blue hover:underline">GitHub</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

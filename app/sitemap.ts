import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPublishedArticles } from "@/lib/db/articles";
import { getOpenJobs } from "@/lib/db/jobs";
import { getServices } from "@/lib/db/services";

const BASE_URL = "https://cyberpolco.com";

const STATIC_PATHS = [
  "",
  "about",
  "achievements",
  "articles",
  "careers",
  "contact",
  "privacy",
  "services",
  "terms",
];

function localizedEntry(path: string, lastModified?: string): MetadataRoute.Sitemap[number] {
  const suffix = path ? `/${path}` : "";
  return {
    url: `${BASE_URL}/${routing.defaultLocale}${suffix}`,
    lastModified,
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((locale) => [locale, `${BASE_URL}/${locale}${suffix}`])
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, jobs, services] = await Promise.all([
    getPublishedArticles(),
    getOpenJobs(),
    getServices(),
  ]);

  return [
    ...STATIC_PATHS.map((path) => localizedEntry(path)),
    ...articles.map((article) => localizedEntry(`articles/${article.slug}`, article.date)),
    ...jobs.map((job) => localizedEntry(`careers/${job.slug}`, job.createdAt)),
    ...services.map((service) => localizedEntry(`services/${service.slug}`)),
  ];
}

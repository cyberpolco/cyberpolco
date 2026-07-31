const BASE_URL = "https://cyberpolco.com";

/** `alternates.languages` for a page's Metadata, keyed by this site's two locales. */
export function localeAlternates(path: string) {
  const suffix = path ? `/${path}` : "";
  return {
    languages: {
      fr: `${BASE_URL}/fr${suffix}`,
      en: `${BASE_URL}/en${suffix}`,
    },
  };
}

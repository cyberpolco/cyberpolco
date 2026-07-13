export const offices = [
  {
    country: "CD",
    fr: { city: "Mbujimayi", label: "Siège social — République Démocratique du Congo" },
    en: { city: "Mbujimayi", label: "Headquarters — Democratic Republic of Congo" },
    phone: "+243 82 811 77 10",
    whatsapp: "https://wa.me/243828117710",
  },
  {
    country: "NA",
    fr: { city: "Windhoek", label: "Bureau — Namibie" },
    en: { city: "Windhoek", label: "Office — Namibia" },
    phone: "+264 81 23 14 352",
    whatsapp: "https://wa.me/264812314352",
  },
];

export const socialLinks = {
  x: "https://www.x.com/cyber_polco",
  linkedin: "https://www.linkedin.com/company/cyberpolco",
  tiktok: "https://www.tiktok.com/@cyberpolco",
  youtube: "https://www.youtube.com/@cyberpolco",
  github: "https://www.github.com/cyberpolco",
  whatsappChannel: "https://whatsapp.com/channel/0029VaZmU8sDZ4LfWF6YTe1G",
};

export const contactEmails = {
  info: "info@cyberpolco.com",
  alt: "cyberpolco@gmail.com",
};

// Real / verifiable facts only — no financial projections (per company decision)
export const stats = [
  { value: "2025", fr: "Année de fondation", en: "Founded" },
  { value: "2", fr: "Pays de présence physique", en: "Countries with physical presence" },
  { value: "4", fr: "Pays d'Afrique australe couverts", en: "Southern African countries covered" },
  { value: "100%", fr: "Sécurité, notre seule priorité", en: "Focused on security, exclusively", durationMs: 5000 },
];

export const presenceCountries = [
  { iso: "COD", status: "physical" as const },
  { iso: "NAM", status: "physical" as const },
  { iso: "ZAF", status: "online" as const },
  { iso: "AGO", status: "online" as const },
  { iso: "ZMB", status: "coming" as const },
];

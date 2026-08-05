// Ten common employment contract types, offered as a fixed dropdown per
// language. Each entry pairs its FR and EN label so picking one in either
// language's dropdown (see JobForm.tsx) selects its equivalent in the other.
export const CONTRACT_TYPE_OPTIONS = [
  { fr: "CDI", en: "Permanent" },
  { fr: "CDD", en: "Fixed-term" },
  { fr: "Freelance", en: "Freelance" },
  { fr: "Stage", en: "Internship" },
  { fr: "Alternance", en: "Apprenticeship" },
  { fr: "Temps partiel", en: "Part-time" },
  { fr: "Intérim", en: "Temporary" },
  { fr: "Contrat de prestation", en: "Consulting" },
  { fr: "Saisonnier", en: "Seasonal" },
  { fr: "Bénévolat", en: "Volunteer" },
] as const;

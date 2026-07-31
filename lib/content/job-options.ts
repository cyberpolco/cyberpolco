// Ten common employment contract types, offered as a fixed dropdown per
// language rather than free text. French and English labels are picked
// independently per field (see JobForm.tsx), so the two lists are aligned
// by position but not otherwise linked.
export const CONTRACT_TYPE_OPTIONS_FR = [
  "CDI",
  "CDD",
  "Freelance",
  "Stage",
  "Alternance",
  "Temps partiel",
  "Intérim",
  "Contrat de prestation",
  "Saisonnier",
  "Bénévolat",
] as const;

export const CONTRACT_TYPE_OPTIONS_EN = [
  "Permanent",
  "Fixed-term",
  "Freelance",
  "Internship",
  "Apprenticeship",
  "Part-time",
  "Temporary",
  "Consulting",
  "Seasonal",
  "Volunteer",
] as const;

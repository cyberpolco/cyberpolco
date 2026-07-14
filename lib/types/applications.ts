// Shared between server and client code for the hiring board — deliberately
// has zero imports of lib/db/client (or anything that touches DATABASE_URL),
// since client components need Stage/STAGES/Application without pulling the
// server-only DB connection into the browser bundle.

export type Stage = "new" | "reviewing" | "interview" | "offer" | "hired" | "rejected";

export const STAGES: { value: Stage; label: string }[] = [
  { value: "new", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "hired", label: "Hired" },
  { value: "rejected", label: "Rejected" },
];

export type Application = {
  id: string;
  jobSlug: string;
  jobTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  cvFileName: string;
  cvUrl: string;
  createdAt: string;
  stage: Stage;
  notes: string | null;
};

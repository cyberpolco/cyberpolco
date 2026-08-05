import type { Job } from "@/lib/db/jobs";

// Type-only import above — this file must stay free of any runtime import of
// lib/db/jobs (and therefore lib/db/client, which opens a DB connection at
// module scope). It's imported directly by client components (e.g.
// JobForm) to render/parse datetime-local values, and pulling in the DB
// client would ship a Neon connection attempt into the browser bundle and
// crash on render. Same issue and fix as lib/academy/progress.ts.

// <input type="datetime-local"> round-trips through the server's local
// timezone, same simplification as lib/academy/quiz.ts's toDatetimeLocalValue.
export function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | null {
  if (!value) return null;
  return new Date(value).toISOString();
}

export type { Job };

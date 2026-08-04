function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toDate(value: string | Date): Date {
  return typeof value === "string" ? new Date(value) : value;
}

/** Admin-panel date format: DD-MM-YYYY. */
export function formatDate(value: string | Date): string {
  const d = toDate(value);
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()}`;
}

/** Admin-panel date+time format: DD-MM-YYYY HH:mm. */
export function formatDateTime(value: string | Date): string {
  const d = toDate(value);
  return `${formatDate(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

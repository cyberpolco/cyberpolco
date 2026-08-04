import { PHONE_UPDATE_COOLDOWN_DAYS } from "@/lib/validation/phone";

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// No previous update means the technician has never changed their own
// number yet, so it's always allowed. Otherwise self-service updates are
// blocked until PHONE_UPDATE_COOLDOWN_DAYS have elapsed since the last
// change — admin edits (lib/actions/users.ts) bypass this check entirely
// but still bump phoneUpdatedAt, resetting this clock either way.
export function canUpdatePhone(phoneUpdatedAt: string | null, now: Date): boolean {
  if (!phoneUpdatedAt) return true;
  const elapsedDays = (now.getTime() - new Date(phoneUpdatedAt).getTime()) / MS_PER_DAY;
  return elapsedDays >= PHONE_UPDATE_COOLDOWN_DAYS;
}

export function nextPhoneUpdateDate(phoneUpdatedAt: string | null): Date | null {
  if (!phoneUpdatedAt) return null;
  return new Date(new Date(phoneUpdatedAt).getTime() + PHONE_UPDATE_COOLDOWN_DAYS * MS_PER_DAY);
}

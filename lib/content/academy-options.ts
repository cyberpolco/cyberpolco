// Student identifier: CPC + YY (registration year) + F (first-name initial)
// + DD (registration day) + L (last-name initial) + NNN (sequence, multiple
// of 7). e.g. CPC26J18M007.
export const STUDENT_ID_PATTERN = /^CPC(\d{2})[A-Z](\d{2})[A-Z](\d{3})$/;

export function isValidStudentId(value: string): boolean {
  const match = STUDENT_ID_PATTERN.exec(value);
  if (!match) return false;

  const [, yy, dd, nnn] = match;
  const year = Number(yy);
  const day = Number(dd);
  const seq = Number(nnn);
  return year >= 26 && year <= 99 && day >= 1 && day <= 31 && seq >= 7 && seq <= 994 && seq % 7 === 0;
}

import bcrypt from "bcryptjs";
import { getUserByEmail, getUserByLinkedId, type User } from "@/lib/db/users";
import { getEnrollmentByStudentId } from "@/lib/db/academy";
import { getStarlinkClientByClientId } from "@/lib/db/starlink";
import { isValidStudentId } from "@/lib/content/academy-options";
import { isValidClientId } from "@/lib/content/starlink-options";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A viewer (student/client) may sign in with either their email or their
// Student/Client ID; staff accounts only ever have an email. This checks
// the identifier is shaped like one of those before any DB lookup happens.
export function isValidLoginIdentifier(identifier: string): boolean {
  return EMAIL_PATTERN.test(identifier) || isValidStudentId(identifier) || isValidClientId(identifier);
}

async function findUserByIdentifier(identifier: string): Promise<User | undefined> {
  if (EMAIL_PATTERN.test(identifier)) return getUserByEmail(identifier);

  if (isValidStudentId(identifier)) {
    const enrollment = await getEnrollmentByStudentId(identifier);
    return enrollment ? getUserByLinkedId("academy_student", enrollment.id) : undefined;
  }

  if (isValidClientId(identifier)) {
    const client = await getStarlinkClientByClientId(identifier);
    return client ? getUserByLinkedId("starlink_client", client.id) : undefined;
  }

  return undefined;
}

export async function verifyUserCredentials(
  identifier: string,
  password: string
): Promise<User | null> {
  const trimmed = identifier.trim();
  if (!isValidLoginIdentifier(trimmed)) return null;

  const user = await findUserByIdentifier(trimmed);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

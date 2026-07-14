import bcrypt from "bcryptjs";
import { getUserByEmail, type User } from "@/lib/db/users";

export async function verifyUserCredentials(
  email: string,
  password: string
): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

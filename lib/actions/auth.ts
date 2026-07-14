"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/rbac";
import { getUserById, updateUserPassword } from "@/lib/db/users";
import {
  createSessionToken,
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
} from "@/lib/auth/session";

const MIN_PASSWORD_LENGTH = 10;

export async function changePasswordAction(formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const currentPassword = String(formData.get("currentPassword") || "");
  const newPassword = String(formData.get("newPassword") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");

  const user = await getUserById(session.userId);
  if (!user) redirect("/admin/login");

  const currentValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!currentValid) {
    redirect("/admin/change-password?error=current");
  }
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    redirect("/admin/change-password?error=length");
  }
  if (newPassword !== confirmPassword) {
    redirect("/admin/change-password?error=mismatch");
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateUserPassword(user.id, passwordHash, false);

  const token = createSessionToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    mustChangePassword: false,
  });
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  redirect("/admin/dashboard");
}

"use server";

import crypto from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth/rbac";
import { ROLES, type Role } from "@/lib/auth/roles";
import {
  saveUser,
  deleteUser,
  getUserByEmail,
  getUserById,
  countSuperAdmins,
  type User,
} from "@/lib/db/users";

const MIN_PASSWORD_LENGTH = 10;

function parseRole(value: FormDataEntryValue | null): Role {
  const role = String(value || "");
  return ROLES.includes(role as Role) ? (role as Role) : "viewer";
}

export async function createUserAction(formData: FormData) {
  const session = await requireRole(["super_admin"]);

  const email = String(formData.get("email") || "").trim();
  const tempPassword = String(formData.get("tempPassword") || "");
  const role = parseRole(formData.get("role"));

  if (tempPassword.length < MIN_PASSWORD_LENGTH) {
    redirect("/admin/users/new?error=length");
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    redirect("/admin/users/new?error=duplicate");
  }

  const passwordHash = await bcrypt.hash(tempPassword, 10);

  const user: User = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    role,
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
    createdBy: session.userId,
    lastLoginAt: null,
  };

  await saveUser(user);
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUserAction(formData: FormData) {
  await requireRole(["super_admin"]);

  const id = String(formData.get("id") || "");
  const email = String(formData.get("email") || "").trim();
  const role = parseRole(formData.get("role"));
  const tempPassword = String(formData.get("tempPassword") || "");

  const existingUser = await getUserById(id);
  if (!existingUser) redirect("/admin/users");

  if (existingUser.role === "super_admin" && role !== "super_admin") {
    const count = await countSuperAdmins();
    if (count <= 1) {
      redirect(`/admin/users/${id}/edit?error=last-super-admin`);
    }
  }

  const duplicate = await getUserByEmail(email);
  if (duplicate && duplicate.id !== id) {
    redirect(`/admin/users/${id}/edit?error=duplicate`);
  }

  let passwordHash = existingUser.passwordHash;
  let mustChangePassword = existingUser.mustChangePassword;
  if (tempPassword) {
    if (tempPassword.length < MIN_PASSWORD_LENGTH) {
      redirect(`/admin/users/${id}/edit?error=length`);
    }
    passwordHash = await bcrypt.hash(tempPassword, 10);
    mustChangePassword = true;
  }

  const user: User = {
    ...existingUser,
    email,
    role,
    passwordHash,
    mustChangePassword,
  };

  await saveUser(user);
  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireRole(["super_admin"]);

  const id = String(formData.get("id") || "");
  if (id === session.userId) {
    redirect("/admin/users?error=self-delete");
  }

  const target = await getUserById(id);
  if (target?.role === "super_admin") {
    const count = await countSuperAdmins();
    if (count <= 1) {
      redirect("/admin/users?error=last-super-admin");
    }
  }

  await deleteUser(id);
  revalidatePath("/admin/users");
}

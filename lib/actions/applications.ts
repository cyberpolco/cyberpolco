"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import {
  updateApplicationStage,
  updateApplicationNotes,
  STAGES,
  type Stage,
} from "@/lib/db/applications";

export async function moveApplicationStageAction(id: string, stage: Stage) {
  await requireRole(["super_admin", "hr_recruiter"]);

  if (!STAGES.some((s) => s.value === stage)) {
    throw new Error("Invalid stage");
  }

  await updateApplicationStage(id, stage);
  revalidatePath("/admin/applications");
  revalidatePath(`/admin/applications/${id}`);
}

export async function updateApplicationNotesAction(id: string, notes: string) {
  await requireRole(["super_admin", "hr_recruiter"]);

  await updateApplicationNotes(id, notes);
  revalidatePath(`/admin/applications/${id}`);
}

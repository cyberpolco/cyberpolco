"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/rbac";
import {
  getApplicationById,
  updateApplicationStage,
  updateApplicationNotes,
  STAGES,
  type Stage,
} from "@/lib/db/applications";
import { isValidStageTransition } from "@/lib/types/applications";

export async function moveApplicationStageAction(id: string, stage: Stage) {
  await requireRole(["super_admin", "hr_recruiter"]);

  if (!STAGES.some((s) => s.value === stage)) {
    throw new Error("Invalid stage");
  }

  const application = await getApplicationById(id);
  if (!application) {
    throw new Error("Application not found");
  }
  if (application.stage === stage) {
    return; // no-op — already on this stage
  }
  if (!isValidStageTransition(application.stage, stage)) {
    throw new Error(
      `Cannot move from "${application.stage}" to "${stage}" — stages can only advance one step at a time (moving to "rejected" is always allowed).`
    );
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

"use client";

import { useState, useTransition } from "react";
import { unstable_rethrow } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "./ConfirmDialog";

export default function DeleteButton({
  action,
  id,
  fieldName = "id",
  confirmTitle = "Delete this item?",
  confirmBody = "This can't be undone.",
  successMessage = "Deleted.",
  label = "Delete",
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  fieldName?: string;
  confirmTitle?: string;
  confirmBody?: string;
  successMessage?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { push } = useToast();

  function handleConfirm() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set(fieldName, id);
      try {
        await action(formData);
        push(successMessage, { variant: "success" });
        setOpen(false);
      } catch (err) {
        unstable_rethrow(err);
        push("Something went wrong. Please try again.", { variant: "error" });
        setOpen(false);
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={label}
        className="text-brand-red"
      >
        <Trash2 size={16} />
      </button>
      {open && (
        <ConfirmDialog
          title={confirmTitle}
          body={confirmBody}
          pending={isPending}
          onConfirm={handleConfirm}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}

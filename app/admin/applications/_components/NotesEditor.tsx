"use client";

import { useState, useTransition } from "react";
import { updateApplicationNotesAction } from "@/lib/actions/applications";

export default function NotesEditor({
  id,
  initialNotes,
}: {
  id: string;
  initialNotes: string;
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setSaved(false);
    startTransition(async () => {
      await updateApplicationNotesAction(id, notes);
      setSaved(true);
    });
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-brand-dark dark:text-white">Notes</label>
      <textarea
        value={notes}
        onChange={(e) => {
          setNotes(e.target.value);
          setSaved(false);
        }}
        rows={5}
        placeholder="Interview impressions, next steps, etc."
        className="w-full rounded-lg border border-black/10 dark:border-white/15 px-4 py-2.5 outline-none focus:border-brand-blue dark:bg-white/5 dark:text-white"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-full bg-brand-red px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isPending ? "Saving…" : "Save notes"}
        </button>
        {saved && <span className="text-xs text-brand-blue">Saved</span>}
      </div>
    </div>
  );
}

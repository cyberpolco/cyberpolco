"use client";

import { useState } from "react";
import { UploadCloud } from "lucide-react";
import BlobFileField from "@/app/admin/_components/BlobFileField";
import SubmitButton from "@/app/admin/_components/SubmitButton";
import { uploadReceiptAction } from "@/lib/actions/receipts";

// Staff/superadmin-only upload widget, rendered next to a read-only
// ReceiptsList — modeled on the certificate-upload block in
// StudentProgressForm.tsx (same BlobFileField, same "use client" +
// server-action form pattern).
export default function ReceiptUploadForm({
  referenceType,
  referenceId,
  clientId,
}: {
  referenceType: "starlink_subscription" | "academy_fee";
  referenceId: string;
  // Only needed for referenceType "starlink_subscription" — the edit route
  // the action revalidates is keyed by the client id, not the site id.
  clientId?: string;
}) {
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  return (
    <form action={uploadReceiptAction} className="mt-3 rounded-xl border border-brand-blue/30 dark:border-brand-blue/40 bg-brand-blue/5 dark:bg-brand-blue/10 p-4">
      <input type="hidden" name="referenceType" value={referenceType} />
      <input type="hidden" name="referenceId" value={referenceId} />
      {clientId && <input type="hidden" name="clientId" value={clientId} />}
      <input type="hidden" name="fileName" value={fileName} />

      <label className="mb-1 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-blue">
        <UploadCloud size={16} />
        Upload receipt (PDF)
      </label>
      <BlobFileField
        kind="receipt"
        name="fileUrl"
        accept="application/pdf"
        value={fileUrl}
        onChange={setFileUrl}
        onFileNameChange={setFileName}
        className="mt-2 w-full text-sm"
      />

      <SubmitButton variant="subtle" className="mt-3" disabled={!fileUrl}>
        Attach receipt
      </SubmitButton>
    </form>
  );
}

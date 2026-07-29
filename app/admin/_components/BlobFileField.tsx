"use client";

import { useState } from "react";
import { uploadFileToBlob, type UploadKind } from "@/lib/blob-client-upload";

export default function BlobFileField({
  kind,
  name,
  accept,
  value,
  onChange,
  onFileNameChange,
  className,
}: {
  kind: UploadKind;
  name: string;
  accept: string;
  value: string;
  onChange: (url: string) => void;
  onFileNameChange?: (fileName: string) => void;
  className?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadFileToBlob(kind, file);
      onChange(uploaded.url);
      onFileNameChange?.(uploaded.fileName);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      e.target.value = "";
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <input type="hidden" name={name} value={value} />
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        disabled={uploading}
        className={className}
      />
      {uploading && <p className="mt-1 text-xs text-brand-gray dark:text-white/60">Uploading…</p>}
      {error && <p className="mt-1 text-xs text-brand-red">{error}</p>}
    </div>
  );
}

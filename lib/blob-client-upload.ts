"use client";

import { upload } from "@vercel/blob/client";

export type UploadKind =
  | "team-photo"
  | "achievement-photo"
  | "certificate"
  | "lesson-material"
  | "cv";

const PATH_PREFIXES: Record<UploadKind, string> = {
  "team-photo": "team-photos",
  "achievement-photo": "achievement-photos",
  certificate: "certificates",
  "lesson-material": "lesson-materials",
  cv: "cvs",
};

function safeFileName(name: string): string {
  return `${Date.now()}-${name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
}

export async function uploadFileToBlob(
  kind: UploadKind,
  file: File
): Promise<{ url: string; fileName: string }> {
  const pathname = `${PATH_PREFIXES[kind]}/${safeFileName(file.name)}`;

  const blob = await upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blob-upload",
    clientPayload: JSON.stringify({ kind }),
  });

  return { url: blob.url, fileName: file.name };
}

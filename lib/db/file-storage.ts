import { promises as fs } from "fs";
import path from "path";

/**
 * Stores an uploaded CV file and returns a URL to reference it later.
 *
 * Uses Vercel Blob when BLOB_READ_WRITE_TOKEN is configured (production).
 * Falls back to writing into /data/uploads for local development, since
 * Vercel's filesystem is read-only in production outside /tmp — the local
 * fallback exists purely so `npm run dev` works with zero setup.
 */
export async function storeCvFile(file: File): Promise<{ url: string; fileName: string }> {
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`cvs/${safeName}`, file, {
      access: "public",
      token: blobToken,
    });
    return { url: blob.url, fileName: file.name };
  }

  const uploadsDir = path.join(process.cwd(), "data", "uploads");
  await fs.mkdir(uploadsDir, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(uploadsDir, safeName), buffer);

  return { url: `local-storage://data/uploads/${safeName}`, fileName: file.name };
}

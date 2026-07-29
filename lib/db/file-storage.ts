import { promises as fs } from "fs";
import path from "path";

/**
 * Returns the configured Blob token, or null to signal the local-disk
 * fallback. On Vercel (VERCEL is always set there), a missing token throws
 * instead of silently falling back — that fallback writes to a filesystem
 * path Vercel doesn't serve, which previously looked like a successful
 * save that just never showed the uploaded file.
 */
function resolveBlobToken(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) return token;
  if (process.env.VERCEL) {
    throw new Error(
      "BLOB_READ_WRITE_TOKEN is not configured. Set it in the Vercel dashboard under Project Settings -> Environment Variables."
    );
  }
  return null;
}

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

  const blobToken = resolveBlobToken();
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

/**
 * Stores an admin-uploaded academy certificate file. Same Vercel Blob /
 * local-fallback logic as storeCvFile, just a distinct storage prefix.
 */
export async function storeCertificateFile(file: File): Promise<{ url: string; fileName: string }> {
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const blobToken = resolveBlobToken();
  if (blobToken) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`certificates/${safeName}`, file, {
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

/**
 * Stores an admin-uploaded lesson material file (PDF or slide deck). Same
 * Vercel Blob / local-fallback logic as storeCvFile, just a distinct storage
 * prefix.
 */
export async function storeLessonMaterialFile(file: File): Promise<{ url: string; fileName: string }> {
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const blobToken = resolveBlobToken();
  if (blobToken) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`lesson-materials/${safeName}`, file, {
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

/**
 * Stores an admin-uploaded team member photo. Same Vercel Blob /
 * local-fallback logic as storeCvFile, just a distinct storage prefix.
 */
export async function storeTeamPhotoFile(file: File): Promise<{ url: string; fileName: string }> {
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const blobToken = resolveBlobToken();
  if (blobToken) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`team-photos/${safeName}`, file, {
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

/**
 * Stores an admin-uploaded achievement photo. Same Vercel Blob /
 * local-fallback logic as storeCvFile, just a distinct storage prefix.
 */
export async function storeAchievementImageFile(file: File): Promise<{ url: string; fileName: string }> {
  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const blobToken = resolveBlobToken();
  if (blobToken) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`achievement-photos/${safeName}`, file, {
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

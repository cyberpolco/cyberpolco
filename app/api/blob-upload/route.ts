import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/rbac";
import type { Role } from "@/lib/auth/roles";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_CERTIFICATE_TYPES,
  MAX_CERTIFICATE_SIZE_BYTES,
  ALLOWED_LESSON_MATERIAL_TYPES,
  MAX_LESSON_MATERIAL_SIZE_BYTES,
  ALLOWED_CV_TYPES,
  MAX_CV_SIZE_BYTES,
} from "@/lib/validation/schemas";

/**
 * Every upload in the app goes direct-to-Blob from the browser, authorized
 * by this route, instead of through a Server Action/API route body. Vercel's
 * serverless functions hard-cap request bodies at 4.5MB regardless of the
 * app's own size limits, which silently broke uploads anywhere close to
 * that ceiling (team photos, lesson materials up to 20MB, etc.) — routing
 * the file bytes straight to Blob storage removes that ceiling entirely.
 */
const UPLOAD_KINDS = {
  "team-photo": {
    prefix: "team-photos/",
    allowedContentTypes: ALLOWED_IMAGE_TYPES,
    maximumSizeInBytes: MAX_IMAGE_SIZE_BYTES,
    allowedRoles: ["super_admin", "content_editor"] as Role[],
  },
  "achievement-photo": {
    prefix: "achievement-photos/",
    allowedContentTypes: ALLOWED_IMAGE_TYPES,
    maximumSizeInBytes: MAX_IMAGE_SIZE_BYTES,
    allowedRoles: ["super_admin", "content_editor"] as Role[],
  },
  certificate: {
    prefix: "certificates/",
    allowedContentTypes: ALLOWED_CERTIFICATE_TYPES,
    maximumSizeInBytes: MAX_CERTIFICATE_SIZE_BYTES,
    allowedRoles: ["super_admin"] as Role[],
  },
  "lesson-material": {
    prefix: "lesson-materials/",
    allowedContentTypes: ALLOWED_LESSON_MATERIAL_TYPES,
    maximumSizeInBytes: MAX_LESSON_MATERIAL_SIZE_BYTES,
    allowedRoles: ["super_admin"] as Role[],
  },
  cv: {
    prefix: "cvs/",
    allowedContentTypes: ALLOWED_CV_TYPES,
    maximumSizeInBytes: MAX_CV_SIZE_BYTES,
    allowedRoles: null,
  },
} as const;

type UploadKind = keyof typeof UPLOAD_KINDS;

function isUploadKind(value: unknown): value is UploadKind {
  return typeof value === "string" && value in UPLOAD_KINDS;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayloadRaw) => {
        const clientPayload = clientPayloadRaw ? JSON.parse(clientPayloadRaw) : {};
        const kind = clientPayload?.kind;
        if (!isUploadKind(kind)) throw new Error("Invalid upload kind.");

        const config = UPLOAD_KINDS[kind];
        if (!pathname.startsWith(config.prefix)) throw new Error("Invalid upload path.");

        if (config.allowedRoles) {
          const session = await getSession();
          if (!session || !config.allowedRoles.includes(session.role)) {
            throw new Error("Not authorized.");
          }
        } else {
          const ip = getClientIp(request.headers);
          const rate = await checkRateLimit(`blob-upload:${kind}:${ip}`, 5, 60_000);
          if (!rate.success) throw new Error("Too many requests. Please try again in a minute.");
        }

        return {
          allowedContentTypes: [...config.allowedContentTypes],
          maximumSizeInBytes: config.maximumSizeInBytes,
          addRandomSuffix: false,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload authorization failed." },
      { status: 400 }
    );
  }
}

import { execSync } from "node:child_process";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import pkg from "./package.json";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Appends the total commit count as semver build metadata (the "+N" suffix)
// so the displayed version (see lib/version.ts) changes on every deploy
// with no manual bump — package.json's version stays the meaningful part,
// this just proves which build is live. Requires "Deep Clone" enabled in
// Vercel's Project Settings → Git; otherwise Vercel's default shallow clone
// truncates `git rev-list --count` to the same fixed depth on every build,
// so the count would stop changing.
function computeAppVersion(): string {
  try {
    const commitCount = execSync("git rev-list --count HEAD").toString().trim();
    return `${pkg.version}+${commitCount}`;
  } catch {
    return pkg.version;
  }
}

process.env.NEXT_PUBLIC_APP_VERSION = computeAppVersion();

// Content-Security-Policy assembled as an array so each source list stays
// readable; joined into one header value below.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "connect-src 'self' https://api.resend.com https://cdn.jsdelivr.net https://vercel.com https://*.public.blob.vercel-storage.com https://challenges.cloudflare.com",
  // Blob storage is also in frame-src so lesson-material PDFs can render
  // inline (see LessonMaterialViewer) instead of opening in a new tab.
  "frame-src https://challenges.cloudflare.com https://*.public.blob.vercel-storage.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
  experimental: {
    // Next's default Server Action body cap is 1MB, below our own upload
    // limits (lesson materials up to 20MB, see lib/validation/schemas.ts).
    // Without this, uploads over 1MB are rejected before the action runs.
    serverActions: {
      bodySizeLimit: "25mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default withNextIntl(nextConfig);

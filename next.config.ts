import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Content-Security-Policy assembled as an array so each source list stays
// readable; joined into one header value below.
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.public.blob.vercel-storage.com",
  "connect-src 'self' https://api.resend.com https://cdn.jsdelivr.net",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

// Applied to every route, /studio included — none of these need to differ
// for Sanity Studio to work.
const commonHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const securityHeaders = [
  ...commonHeaders,
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Frame-Options", value: "DENY" },
];

// Sanity Studio (/studio) needs a relaxed CSP: to talk to Sanity's API/CDN,
// and to allow framing from sanity.io, which embeds deployed studios in an
// iframe for its hosted "Studio in the browser" feature.
const studioCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://core.sanity-cdn.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "img-src 'self' data: blob: https://cdn.sanity.io",
  "connect-src 'self' https://*.api.sanity.io https://*.apicdn.sanity.io wss://*.api.sanity.io https://core.sanity-cdn.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self' https://sanity.io https://*.sanity.io",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Excludes /studio: Sanity's hosted "Studio in the browser" embeds
        // deployed studios in a cross-origin iframe, which X-Frame-Options
        // DENY would block outright (CSP frame-ancestors below handles
        // framing rules for /studio instead).
        source: "/:path((?!studio(?:/|$)).*)",
        headers: securityHeaders,
      },
      {
        source: "/studio/:path*",
        headers: [...commonHeaders, { key: "Content-Security-Policy", value: studioCsp }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

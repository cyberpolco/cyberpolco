// Baked in at build time by next.config.ts (see computeAppVersion there) —
// "dev" is only ever seen if this somehow renders without going through
// that build step (e.g. a test importing this module directly).
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Verifies a Cloudflare Turnstile token server-side.
 *
 * Returns true (bypass) when TURNSTILE_SECRET_KEY isn't configured, so the
 * contact/application forms keep working end-to-end without a Cloudflare
 * account set up — matches the widget itself, which renders nothing until
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is set. See README.md -> "Enabling CAPTCHA".
 */
export async function verifyTurnstileToken(token: string, remoteIp?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}

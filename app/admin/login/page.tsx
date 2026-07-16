import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { verifyUserCredentials } from "@/lib/auth/credentials";
import { ensureBootstrapSuperAdmin } from "@/lib/auth/bootstrap";
import { touchLastLogin } from "@/lib/db/users";
import { createSessionToken, ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import PasswordField from "@/app/admin/_components/PasswordField";
import SignInButton from "@/app/admin/_components/SignInButton";

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const ip = getClientIp(await headers());
  const rate = await checkRateLimit(`admin-login:${ip}`, 5, 5 * 60_000);
  if (!rate.success) {
    redirect("/admin/login?error=rate-limit");
  }

  await ensureBootstrapSuperAdmin();

  const user = await verifyUserCredentials(email, password);
  if (!user) {
    redirect("/admin/login?error=invalid");
  }

  let token: string;
  try {
    token = createSessionToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      viewerType: user.viewerType,
      linkedId: user.linkedId,
    });
  } catch {
    redirect("/admin/login?error=config");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
  });

  await touchLastLogin(user.id);

  redirect(user.mustChangePassword ? "/admin/change-password" : "/admin/dashboard");
}

const binaryDigits = [
  { top: "10%", left: "8%", char: "1", duration: "6s", twinkle: "3.2s", delay: "0s" },
  { top: "22%", left: "88%", char: "0", duration: "7.5s", twinkle: "4s", delay: "0.6s" },
  { top: "68%", left: "10%", char: "0", duration: "5.5s", twinkle: "2.8s", delay: "1.1s" },
  { top: "80%", left: "82%", char: "1", duration: "8s", twinkle: "3.6s", delay: "0.3s" },
  { top: "15%", left: "45%", char: "0", duration: "6.8s", twinkle: "3s", delay: "1.6s" },
  { top: "48%", left: "94%", char: "1", duration: "7s", twinkle: "4.4s", delay: "0.8s" },
  { top: "34%", left: "18%", char: "1", duration: "6.2s", twinkle: "3.4s", delay: "1.9s" },
  { top: "88%", left: "48%", char: "0", duration: "7.2s", twinkle: "3.8s", delay: "0.4s" },
  { top: "5%", left: "65%", char: "0", duration: "6.5s", twinkle: "3.1s", delay: "1.2s" },
  { top: "58%", left: "4%", char: "1", duration: "7.8s", twinkle: "4.1s", delay: "0.9s" },
] as const;

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-dark px-5">
      {/* tech background */}
      <div className="hero-grid pointer-events-none absolute inset-0" />
      <div className="hero-glow-orb pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-brand-blue/25 blur-3xl" />
      <div
        className="hero-glow-orb pointer-events-none absolute -right-16 top-0 h-96 w-96 rounded-full bg-brand-red/20 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      {/* orbiting satellite ring */}
      <div className="pointer-events-none absolute inset-6 hidden animate-spin rounded-full border border-dashed border-brand-blue/15 [animation-duration:32s] sm:block">
        <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-brand-yellow shadow-[0_0_10px_2px_rgba(230,156,63,0.7)]" />
      </div>
      {/* floating binary digits */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        {binaryDigits.map((b, i) => (
          <span
            key={i}
            className="login-binary absolute select-none font-mono text-sm font-bold text-brand-blue/30"
            style={{
              top: b.top,
              left: b.left,
              animationDelay: b.delay,
              ["--hero-particle-duration" as string]: b.duration,
              ["--hero-particle-twinkle" as string]: b.twinkle,
            }}
          >
            {b.char}
          </span>
        ))}
      </div>

      <Link
        href="/"
        className="fixed left-5 top-5 z-10 inline-flex items-center gap-1.5 text-sm font-semibold text-white/70 transition-colors hover:text-white"
      >
        <ArrowLeft size={16} />
        Home
      </Link>

      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo-mark.png"
            alt="Cyber PolCo"
            width={64}
            height={64}
            className="mb-3 object-contain"
          />
          <h1 className="font-display text-xl font-bold text-brand-dark">Cyber PolCo Admin</h1>
          <p className="mt-1 text-sm text-brand-gray">Sign in to manage the site.</p>
        </div>

        <form action={login} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
            />
          </div>
          <PasswordField />

          {error === "invalid" && (
            <p className="text-sm text-brand-red">
              Incorrect email or password. Please contact your admin or Lam.
            </p>
          )}
          {error === "config" && (
            <p className="text-sm text-brand-red">
              Server isn&apos;t configured yet. Set ADMIN_SESSION_SECRET (see README.md).
            </p>
          )}
          {error === "rate-limit" && (
            <p className="text-sm text-brand-red">
              Too many login attempts. Please wait a few minutes and try again.
            </p>
          )}

          <SignInButton />
        </form>
      </div>
    </div>
  );
}

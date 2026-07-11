import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyAdminCredentials } from "@/lib/auth/credentials";
import { createSessionToken, ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";

async function login(formData: FormData) {
  "use server";

  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  let valid = false;
  let configError = false;
  try {
    valid = await verifyAdminCredentials(email, password);
    if (valid) {
      const token = createSessionToken(email);
      const cookieStore = await cookies();
      cookieStore.set(ADMIN_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
      });
    }
  } catch {
    configError = true;
  }

  if (configError) {
    redirect("/admin/login?error=config");
  }

  if (!valid) {
    redirect("/admin/login?error=invalid");
  }

  redirect("/admin/dashboard");
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-5">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white p-8 shadow-xl">
        <h1 className="font-display text-xl font-bold text-brand-dark">Cyber PolCo Admin</h1>
        <p className="mt-1 text-sm text-brand-gray">Sign in to manage the site.</p>

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
          <div>
            <label className="mb-1 block text-sm font-medium text-brand-dark">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full rounded-lg border border-black/10 px-4 py-2.5 outline-none focus:border-brand-blue"
            />
          </div>

          {error === "invalid" && (
            <p className="text-sm text-brand-red">Incorrect email or password.</p>
          )}
          {error === "config" && (
            <p className="text-sm text-brand-red">
              Admin account isn&apos;t configured yet. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH, and
              ADMIN_SESSION_SECRET (see README.md).
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

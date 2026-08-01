import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import Image from "next/image";
import { isValidLoginIdentifier, verifyUserCredentials } from "@/lib/auth/credentials";
import { ensureBootstrapSuperAdmin } from "@/lib/auth/bootstrap";
import { touchLastLogin } from "@/lib/db/users";
import { createSessionToken, ADMIN_COOKIE_NAME, ADMIN_SESSION_MAX_AGE_SECONDS } from "@/lib/auth/session";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { routing, type Locale } from "@/i18n/routing";
import enMessages from "@/messages/en.json";
import frMessages from "@/messages/fr.json";
import AuthPageBackground from "@/app/admin/_components/AuthPageBackground";
import LoginCard from "@/app/admin/_components/LoginCard";

const LOGIN_MESSAGES: Record<Locale, (typeof enMessages)["admin"]["login"]> = {
  en: enMessages.admin.login,
  fr: frMessages.admin.login,
};

async function getLoginLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  return routing.locales.includes(localeCookie as Locale) ? (localeCookie as Locale) : routing.defaultLocale;
}

async function login(formData: FormData) {
  "use server";

  const identifier = String(formData.get("identifier") || "").trim();
  const password = String(formData.get("password") || "");

  const ip = getClientIp(await headers());
  const rate = await checkRateLimit(`admin-login:${ip}`, 5, 5 * 60_000);
  if (!rate.success) {
    redirect("/admin/login?error=rate-limit");
  }

  await ensureBootstrapSuperAdmin();

  if (!isValidLoginIdentifier(identifier)) {
    redirect("/admin/login?error=format");
  }

  const user = await verifyUserCredentials(identifier, password);
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

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const locale = await getLoginLocale();
  const t = LOGIN_MESSAGES[locale];
  const errorMessages = {
    config: t.errorConfig,
    "rate-limit": t.errorRateLimit,
  };

  return (
    <AuthPageBackground homeLabel={t.home}>
      <div className="flex flex-col items-center text-center">
        <Image
          src="/images/logo-mark.png"
          alt="Cyber PolCo"
          width={64}
          height={64}
          className="mb-3 object-contain"
        />
        <h1 className="font-display text-xl font-bold text-brand-dark">{t.title}</h1>
      </div>

      <LoginCard
        loginAction={login}
        error={error}
        errorMessages={errorMessages}
        roleLabels={[t.roleAdmin, t.roleClient, t.roleStudent]}
        roleContent={[t.roles.admin, t.roles.client, t.roles.student]}
        password={t.password}
        showPassword={t.showPassword}
        hidePassword={t.hidePassword}
        signIn={t.signIn}
        signingIn={t.signingIn}
      />
    </AuthPageBackground>
  );
}

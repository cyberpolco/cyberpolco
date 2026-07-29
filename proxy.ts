import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { isRouteAllowed } from "@/lib/auth/roles";

const intlProxy = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area: guard everything except /admin/login. Segment-bound check —
  // pathname.startsWith("/admin") would also match bot-scan paths like
  // "/admin.php", redirecting them to the real login page instead of
  // letting them 404 through the locale router below.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    const isLoginPage = pathname === "/admin/login";
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    const session = verifySessionToken(token);

    if (!session.valid && !isLoginPage) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (session.valid && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

    if (session.valid) {
      const isChangePasswordPage = pathname === "/admin/change-password";

      if (session.mustChangePassword && !isChangePasswordPage) {
        return NextResponse.redirect(new URL("/admin/change-password", request.url));
      }
      if (!session.mustChangePassword && isChangePasswordPage) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      if (!isRouteAllowed(pathname, session.role)) {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    }

    return NextResponse.next();
  }

  // Everything else (public site) goes through locale routing
  return intlProxy(request);
}

export const config = {
  // Deliberately not the common `.*\..*` catch-all some next-intl examples
  // use for "skip static files" — that also matches bot-scan paths like
  // `/admin.php`, which then skip this proxy entirely and hit
  // app/[locale]/page.tsx with locale="admin.php", crashing instead of
  // 404ing. List the site's actual static extensions instead.
  matcher: [
    "/((?!api|_next|_vercel|.*\\.(?:ico|png|jpg|jpeg|svg|webp|gif|css|js|txt|xml|json|woff2?|ttf)$).*)",
  ],
};

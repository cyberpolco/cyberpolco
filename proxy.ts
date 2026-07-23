import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";
import { isRouteAllowed } from "@/lib/auth/roles";

const intlProxy = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin area: guard everything except /admin/login
  if (pathname.startsWith("/admin")) {
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
  matcher: [
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};

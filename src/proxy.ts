import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Proxy / middleware to protect admin dashboard routes and handle locale redirects.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root to default locale
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/en", request.url));
  }

  // Protect dashboard-admin routes (except login page itself)
  if (
    pathname.startsWith("/dashboard-admin") &&
    !pathname.startsWith("/dashboard-admin/login")
  ) {
    const session = request.cookies.get("admin_session");

    if (!session?.value) {
      const loginUrl = new URL("/dashboard-admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard-admin/:path*",
  ],
};

import createIntlProxy from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";

import { routing } from "@/i18n/routing";

const handleI18n = createIntlProxy(routing);

/**
 * Next 16 renamed `middleware` to `proxy`. The edge runtime is not supported
 * here; proxy always runs on Node.js, which suits @supabase/ssr.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin is English-only and lives outside the [locale] segment.
  if (pathname.startsWith("/dashboard-admin")) {
    return NextResponse.next();
  }

  // Never let the prefixed English form become a second indexable URL.
  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/en/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  return handleI18n(request);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*[.].*).*)"],
};

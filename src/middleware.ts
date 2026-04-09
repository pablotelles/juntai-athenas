import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/auth/login", "/auth/callback"];
const SESSION_COOKIE = "juntai_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public auth routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;

  // No session → redirect to login, preserving the intended destination
  if (!sessionToken) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/* (Next.js internals)
     * - favicon.ico, robots.txt, sitemap.xml
     * - *.{css,js,png,jpg,svg,ico,woff2} (static assets)
     */
    "/((?!_next|favicon\\.ico|robots\\.txt|sitemap\\.xml|.*\\.(?:css|js|png|jpg|jpeg|svg|ico|woff2)).*)",
  ],
};

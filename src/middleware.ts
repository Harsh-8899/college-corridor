import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // Identify if request is on the admin subdomain
  const isAdminSubdomain = host.startsWith("admin.collegecorridor.com") || host.startsWith("admin.localhost");

  // Bypass static files, Next.js internals, and Auth API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/static")
  ) {
    return NextResponse.next();
  }

  // 1. Admin Subdomain Routing
  if (isAdminSubdomain) {
    // Allow standard login page access
    if (pathname === "/login") {
      return NextResponse.next();
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    const isAuthorized = token && ["ADMIN", "SUPER_ADMIN"].includes(token.role || "");

    if (!isAuthorized) {
      if (pathname.startsWith("/api")) {
        return NextResponse.json(
          { error: { message: "Unauthorized. Admin access required." } },
          { status: 401 }
        );
      }
      
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Permitted: API routes do not rewrite
    if (pathname.startsWith("/api")) {
      return NextResponse.next();
    }

    // Rewrites other paths internally (e.g. / -> /admin, /users -> /admin/users)
    if (!pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  // 2. Public Domain Routing
  // Block public domain from accessing admin routes casually
  if (pathname.startsWith("/admin") || pathname === "/internal/admin" || pathname.startsWith("/internal/admin/")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect internal routes on public domain
  if (pathname.startsWith("/internal")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Must be logged in and NOT a regular student
    if (!token || !token.role || token.role === "STUDENT") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role as string;
    
    // Admin has access to everything
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      return NextResponse.next();
    }

    // Editor has access to /internal/admin (redirect to / for public domain) and settings
    if (role === "EDITOR") {
      if (pathname.startsWith("/internal/crm") || pathname.startsWith("/internal/counselor")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    // Counselor has access to /internal/crm, /internal/counselor, and /internal/settings
    if (role === "COUNSELOR") {
      if (pathname.startsWith("/internal/admin")) {
        return NextResponse.redirect(new URL("/internal/crm", request.url));
      }
      return NextResponse.next();
    }
  }

  // Protect API admin routes on public domain
  if (pathname.startsWith("/api/v1/admin")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !["ADMIN", "SUPER_ADMIN"].includes(token.role || "")) {
      return NextResponse.json(
        { error: { message: "Unauthorized. Admin access required." } },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

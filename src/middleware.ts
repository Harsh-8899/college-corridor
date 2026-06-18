import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") || "";

  // 1. Non-www to www redirect (for production collegecorridor.com)
  if (host === "collegecorridor.com") {
    const wwwUrl = new URL(pathname, "https://www.collegecorridor.com");
    wwwUrl.search = request.nextUrl.search;
    return NextResponse.redirect(wwwUrl, 301);
  }

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

  const response = NextResponse.next();

  // 2. Admin Subdomain Routing
  if (isAdminSubdomain) {
    // Inject noindex, nofollow headers to prevent search indexing of admin pages
    response.headers.set("X-Robots-Tag", "noindex, nofollow");

    // Redirect root page on admin subdomain to internal admin dashboard
    if (pathname === "/") {
      return NextResponse.redirect(new URL("/internal/admin", request.url));
    }

    // Allow standard login page access
    if (pathname === "/login") {
      return response;
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // Valid internal roles
    const isAuthorized = token && ["ADMIN", "SUPER_ADMIN", "MANAGEMENT", "EDITOR", "COUNSELOR", "CRM", "WEBSITE_MANAGER", "SALES_MANAGER"].includes(token.role || "");

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
      return response;
    }

    // Rewrite standard internal requests correctly if not prefix-matched
    if (!pathname.startsWith("/internal") && !pathname.startsWith("/login")) {
      const url = request.nextUrl.clone();
      url.pathname = `/internal${pathname}`;
      return NextResponse.rewrite(url);
    }

    return response;
  }

  // 3. Public Domain Routing (www.collegecorridor.com / localhost)
  // Block public domain from accessing internal or admin routes
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/internal") ||
    pathname === "/crm" ||
    pathname.startsWith("/crm/") ||
    pathname === "/counselor" ||
    pathname.startsWith("/counselor/") ||
    pathname === "/super-admin" ||
    pathname.startsWith("/super-admin/")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Protect university partner routes
  if (pathname.startsWith("/partner")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    if (!token || !["UNIVERSITY_PARTNER", "ADMIN", "SUPER_ADMIN"].includes(token.role || "")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files.
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};


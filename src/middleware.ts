import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /internal/* routes
  if (pathname.startsWith("/internal")) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    });

    // 1. Must be logged in and NOT a regular student
    if (!token || !token.role || token.role === "STUDENT") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 2. Role-based routing restrictions within /internal
    const role = token.role as string;
    
    // Admin has access to everything
    if (role === "ADMIN") {
      return NextResponse.next();
    }

    // Editor has access to /internal/admin (which is College Management for them) and /internal/settings
    if (role === "EDITOR") {
      if (pathname.startsWith("/internal/crm") || pathname.startsWith("/internal/counselor")) {
        return NextResponse.redirect(new URL("/internal/admin", request.url));
      }
      return NextResponse.next();
    }

    // Counselor has access to /internal/crm, /internal/counselor, and /internal/settings
    if (role === "COUNSELOR") {
      if (pathname === "/internal/admin" || pathname.startsWith("/internal/admin/")) {
        return NextResponse.redirect(new URL("/internal/crm", request.url));
      }
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/internal/:path*"]
};

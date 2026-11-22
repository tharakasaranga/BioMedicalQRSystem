import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const userRole = payload.role;

      // Super Admin ONLY routes (User Management)
      if (pathname.startsWith("/dashboard/users") && userRole !== "super_admin") {
        return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url));
      }

      // Admin & Super Admin ONLY routes (Stock Management)
      if (pathname.startsWith("/dashboard/stock") && userRole !== "admin" && userRole !== "super_admin") {
        return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url));
      }

      // Technician, Admin & Super Admin routes (Fault Management)
      if (pathname.startsWith("/dashboard/manage-faults") && userRole === "staff") {
        return NextResponse.redirect(new URL("/dashboard?error=unauthorized", req.url));
      }

      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
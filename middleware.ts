import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const pathname = request.nextUrl.pathname

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/instructor") ||
      pathname.startsWith("/student") ||
      pathname.startsWith("/courses") ||
      pathname === "/dashboard"
    ) {
      const url = new URL("/auth/login", request.url)
      url.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Redirect /dashboard to role-specific dashboard
  if (pathname === "/dashboard") {
    if (token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url))
    } else if (token?.role === "INSTRUCTOR") {
      return NextResponse.redirect(new URL("/instructor/dashboard", request.url))
    } else if (token?.role === "STUDENT") {
      return NextResponse.redirect(new URL("/student/dashboard", request.url))
    }
  }

  // Protect admin routes
  if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Protect instructor routes (instructors and admins)
  if (pathname.startsWith("/instructor") && token?.role !== "INSTRUCTOR" && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Protect student routes (students and admins)
  if (pathname.startsWith("/student") && token?.role !== "STUDENT" && token?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/admin/:path*", "/instructor/:path*", "/student/:path*", "/courses/:path*"],
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This middleware is now much simpler since we're handling auth client-side
export async function middleware(request: NextRequest) {
  // Define API routes that should be accessible without authentication
  const publicApiRoutes = ["/api/auth/login", "/api/auth/check-admin"]

  // Allow all API routes to be accessed directly
  if (request.nextUrl.pathname.startsWith("/api") && !publicApiRoutes.includes(request.nextUrl.pathname)) {
    // For API routes, we'll let the endpoints handle their own auth
    return NextResponse.next()
  }

  // All other routes will be handled by client-side auth
  return NextResponse.next()
}

// Configure paths to be processed by middleware
export const config = {
  matcher: [
    // Match all API routes
    "/api/:path*",
  ],
}


import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  
  // Check for session cookie with updated names
  const sessionToken = request.cookies.get('next-auth.session-token')?.value || 
                      request.cookies.get('__Host-next-auth.session-token')?.value ||
                      request.cookies.get('__Secure-next-auth.session-token')?.value

  const isPublicDashboardRoute = request.nextUrl.pathname === '/dashboard' || 
                                 request.nextUrl.pathname.startsWith('/dashboard/projects/new') ||
                                 request.nextUrl.pathname.match(/^\/dashboard\/projects\/demo_\d+\/workspace/)

  // For dashboard pages, check if user is authenticated
  if (isDashboardPage) {
    // Allow public access to main dashboard and project creation
    if (isPublicDashboardRoute) {
      return NextResponse.next()
    }

    // Allow authenticated users to access all dashboard pages
    if (sessionToken) {
      return NextResponse.next()
    }

    // Debug logging
    console.log('Middleware check:', {
      pathname: request.nextUrl.pathname,
      hasSessionToken: !!sessionToken,
      cookieNames: request.cookies.getAll().map(c => c.name),
      userAgent: request.headers.get('user-agent')?.substring(0, 50)
    })
    
    // Only redirect if no session token AND not already on login page
    if (!sessionToken && !isAuthPage) {
      console.log('No session token found, redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
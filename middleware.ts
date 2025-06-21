import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check if the request is for an admin page
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin session cookie
    const adminSession = request.cookies.get('admin-authenticated');
    
    // If no session or invalid session, redirect to login
    if (!adminSession || adminSession.value !== 'true') {
      // Allow access to the login API route
      if (request.nextUrl.pathname === '/admin/api/login') {
        return NextResponse.next();
      }
      
      // For admin pages, show the login prompt
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
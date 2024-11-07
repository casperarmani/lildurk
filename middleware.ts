import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Check if there's a token in localStorage
  const token = req.cookies.get('auth_token')?.value;

  // Protected routes that require authentication
  const protectedRoutes = ['/chat', '/dashboard', '/settings'];
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // Auth routes that should redirect if user is already logged in
  const authRoutes = ['/login', '/signup'];
  const isAuthRoute = authRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  );

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const redirectUrl = new URL('/login', req.url);
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If trying to access auth routes with token, redirect to chat
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/chat', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // Match all paths except static files and api routes
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
};
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

// Public routes that don't require authentication (but might need localization)
// Note: We need to check both with and without locale prefix
const publicPathnames = ["/login", "/signup", "/", "/onboarding", "/forgot-password"];

// Protected routes that require authentication
const protectedPathnames = ["/games", "/clubs", "/profile"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Handle next-intl middleware for all routes to ensure locale is handled
  // We'll capture the response from intlMiddleware but might override it for auth redirects
  const response = intlMiddleware(request);

  // Extract locale from the path if present (e.g. /en/login -> en)
  const pathnameIsMissingLocale = routing.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // If the path is missing a locale, next-intl will redirect. 
  // We can let it handle the redirect, but we need to check auth logic too.
  // However, next-intl redirect happens before we can check the final destination.
  // Simplest approach: Let next-intl normalize the path first. 
  // If next-intl redirects (e.g. / -> /en), we return that response immediately.
  if (pathnameIsMissingLocale && !pathname.startsWith('/api') && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    return response;
  }

  // Get the path without the locale prefix for auth checking
  // e.g. /en/games -> /games
  const locale = request.nextUrl.pathname.split('/')[1];
  const isValidLocale = routing.locales.includes(locale as any);

  let internalPathname = pathname;
  if (isValidLocale) {
    internalPathname = pathname.replace(`/${locale}`, '') || '/';
  }

  const authToken = request.cookies.get("auth-token")?.value;

  const isProtectedRoute = protectedPathnames.some((route) =>
    internalPathname.startsWith(route)
  );

  // If accessing a protected route without auth token, redirect to login
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set("redirect", internalPathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth pages while authenticated, redirect to dashboard
  if ((internalPathname === "/login" || internalPathname === "/signup") && authToken) {
    return NextResponse.redirect(new URL(`/${locale}/games`, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};

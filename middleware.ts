import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/login', '/register', '/forgot-password', '/'];

// Define protected routes that require authentication
const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for service worker files and other static assets
    if (
        pathname.startsWith('/sw') ||
        pathname.endsWith('.js') ||
        pathname.endsWith('.css') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname === '/favicon.ico'
    ) {
        return NextResponse.next();
    }

    // Check if maintenance mode is enabled
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';
    const isMaintenancePage = pathname === '/maintenance';

    // If maintenance mode is enabled and user is not on maintenance page, redirect to maintenance
    if (isMaintenanceMode && !isMaintenancePage) {
        return NextResponse.redirect(new URL('/maintenance', request.url));
    }

    // If maintenance mode is disabled and user is on maintenance page, redirect to home
    if (!isMaintenanceMode && isMaintenancePage) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Temporarily disable other middleware logic to allow client-side auth handling
    // The auth context will handle redirects on the client side
    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - service worker files (sw.js, sw-cache.js)
         * - static assets (.js, .css, images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|sw.*\\.js|.*\\.(?:js|css|svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
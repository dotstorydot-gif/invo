import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const sessionUser = request.cookies.get('invoica_session')?.value

    const publicPaths = ['/login', '/api'];
    const isPublicPath = publicPaths.some(p => request.nextUrl.pathname.startsWith(p));

    // If unauthenticated and trying to access protected route (anything not /login or /api)
    if (!sessionUser && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // If authenticated and trying to access /login, redirect to dashboard
    if (sessionUser && request.nextUrl.pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // RBAC checks for Superadmin
    if (sessionUser && request.nextUrl.pathname.startsWith('/superadmin')) {
        try {
            const user = JSON.parse(sessionUser);
            if (user.role !== 'Superadmin') {
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch {
            // Ignore parse error, it will just fall through
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|images|fonts|locales|.*\\.).*)'],
}

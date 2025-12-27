import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;

            // Check if the path is a protected route (dashboard)
            // We need to account for localized paths (e.g., /en, /ja/tickets)
            const isProtected = (pathname: string) => {
                // Remove locale prefix (e.g., /en or /ja) to check the base path
                const localePrefixRegex = /^\/(en|ja)/;
                const pathWithoutLocale = pathname.replace(localePrefixRegex, '');

                // Normalize empty path to / for the root
                const normalizedPath = pathWithoutLocale === '' ? '/' : pathWithoutLocale;

                return normalizedPath === '/' ||
                    normalizedPath.startsWith('/tickets') ||
                    normalizedPath.startsWith('/settings') ||
                    normalizedPath.startsWith('/vector-search');
            };

            const isOnDashboard = isProtected(nextUrl.pathname);
            const isLoginPage = nextUrl.pathname.includes('/login');

            if (isOnDashboard) {
                if (isLoggedIn) return true;
                return Response.redirect(new URL('/login', nextUrl)); // Redirect unauthenticated users to login page
            } else if (isLoggedIn && isLoginPage) {
                // If logged in and on login page, redirect to dashboard
                // We should preserve the locale if present, default to / otherwise
                const localeMatch = nextUrl.pathname.match(/^\/(en|ja)/);
                const locale = localeMatch ? localeMatch[0] : '';
                return Response.redirect(new URL(`${locale}/`, nextUrl));
            }
            return true;
        },
    },
    providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;

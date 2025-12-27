import NextAuth from 'next-auth';
import type { NextRequest } from 'next/server';
import { authConfig } from './auth.config';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default NextAuth(authConfig).auth((req) => {
    return intlMiddleware(req as NextRequest);
});

export const config = {
    // Matcher excluding API, static files, but including all other paths requiring auth or i18n
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};

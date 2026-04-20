import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export function proxy(request) {
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!_next|_vercel|favicon.ico|.*\\..*).*)'],
};

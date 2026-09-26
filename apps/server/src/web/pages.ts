import {
  Catch,
  Controller,
  Get,
  HttpException,
  Inject,
  NotFoundException,
  Req,
  Res,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { isPageRequest } from '../access/access.guard.ts';
import { Public, Rule } from '../access/rules.ts';

export const WEB_INDEX = Symbol('WebIndexHtml');

const NOT_BUILT = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Bow Reseller Portal</title></head>
<body><p>The browser application has not been built. Run <code>./scripts/dev.sh</code>.</p></body></html>`;

/**
 * Fully decoded (a double-encoded %252F included), backslashes read as
 * slashes, repeated slashes collapsed, lower-cased. Dot segments are NOT
 * resolved: a browser never sends one it could resolve, so one that arrives
 * here was hidden behind an encoding, and resolving it would make the server
 * and the browser disagree about which page the address names (review N-3).
 */
export function canonicalPath(path: string): string {
  let decoded = path;
  for (let i = 0; i < 3; i++) {
    let next: string;
    try {
      next = decodeURIComponent(decoded);
    } catch {
      break;
    }
    if (next === decoded) break;
    decoded = next;
  }
  return decoded.replace(/\\/g, '/').replace(/\/{2,}/g, '/').toLowerCase().replace(/(.)\/$/, '$1');
}

/** What no address to an internal page may hold: a dot segment, or a control or separator character. */
function unservable(canonical: string): boolean {
  return canonical.split('/').some((segment) => segment === '.' || segment === '..') || /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/.test(canonical);
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export function loadIndexHtml(file: string): string {
  return existsSync(file) ? readFileSync(file, 'utf8') : NOT_BUILT;
}

function page(title: string, message: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title} — Bow Reseller Portal</title>
<style>body{font-family:system-ui,sans-serif;margin:48px auto;max-width:560px;padding:0 16px;color:#242424}a{color:#0f6cbd}</style></head>
<body><h1>${escapeHtml(title)}</h1><p>${escapeHtml(message)}</p><p><a href="/">Back to the portal</a></p></body></html>`;
}

/**
 * The browser application's pages. The internal side's pages (/sales/…) are
 * behind the same guard as its interface routes: a reseller who opens one is
 * refused on the server and the attempt recorded (story-01-04 c3, c4), before
 * any of the page is sent.
 */
@Controller()
export class PagesController {
  constructor(@Inject(WEB_INDEX) private readonly indexHtml: string) {}

  @Rule({ audience: 'internal', action: 'open page' })
  @Get(['sales', 'sales/*'])
  salesPage(@Res() reply: FastifyReply) {
    return reply.type('text/html').header('cache-control', 'no-store').send(this.indexHtml);
  }

  @Public()
  @Get('*')
  otherPage(@Req() request: FastifyRequest, @Res() reply: FastifyReply) {
    const [path = '/', query] = request.url.split('?');
    const canonical = canonicalPath(path);
    // Another spelling of an internal page (/SALES/store, //sales/store,
    // /sales%2Fstore) is sent to the one spelling the guard protects, so it is
    // refused and recorded like the page itself, never served here.
    if (canonical === '/sales' || canonical.startsWith('/sales/')) {
      // Already in the guarded spelling yet not matched by the guarded route,
      // or holding a hidden dot segment or a control character: never serve it (N-1, N-3).
      if (canonical === path || unservable(canonical)) throw new NotFoundException();
      return reply.redirect(`${encodeURI(canonical)}${query !== undefined ? `?${query}` : ''}`, 308);
    }
    // The /dev pages exist only when the dev module is loaded; everything else under /api or /dev is not found.
    if (!isPageRequest(canonical) || canonical === '/dev' || canonical.startsWith('/dev/')) throw new NotFoundException();
    return reply.type('text/html').header('cache-control', 'no-store').send(this.indexHtml);
  }
}

/** Pages answer as pages (a sign-in redirect, a refusal page); interface routes answer as JSON. */
@Catch(HttpException)
export class PageAwareExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const request = host.switchToHttp().getRequest<FastifyRequest>();
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const status = exception.getStatus();
    if (!isPageRequest(request.url)) {
      const body = exception.getResponse();
      const message = typeof body === 'string' ? body : (body as { message?: unknown }).message;
      return reply.status(status).send({ statusCode: status, message: Array.isArray(message) ? message.join('; ') : message });
    }
    if (status === 401) {
      return reply.redirect(`/sign-in?next=${encodeURIComponent(request.url)}`, 302);
    }
    if (status === 403) {
      return reply.status(403).type('text/html').send(page('Access refused', 'You do not have access to this page. The attempt has been recorded.'));
    }
    return reply.status(status).type('text/html').send(page(status === 404 ? 'Not found' : 'Something went wrong', status === 404 ? 'There is no page at this address.' : exception.message));
  }
}

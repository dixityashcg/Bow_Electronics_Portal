import {
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { timingSafeEqual } from 'node:crypto';
import type { FastifyRequest } from 'fastify';
import { AccessService, type ResolvedSession } from './access.service.ts';
import { ROUTE_RULE, type RouteRule } from './rules.ts';

export const SESSION_COOKIE = 'bow_session';
export const CSRF_HEADER = 'x-csrf-token';

declare module 'fastify' {
  interface FastifyRequest {
    portal?: ResolvedSession;
  }
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function sameToken(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Pages are answered as pages; interface routes as JSON. */
export function isPageRequest(url: string): boolean {
  return !url.startsWith('/api/') && !url.startsWith('/dev/api/');
}

/**
 * The global guard. Default deny: a route with no declared rule is refused.
 * Authorisation is decided here, on the server, on every call; the browser
 * application holds no authority.
 */
@Injectable()
export class AccessGuard implements CanActivate {
  private readonly logger = new Logger(AccessGuard.name);

  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AccessService) private readonly access: AccessService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rule = this.reflector.getAllAndOverride<RouteRule | undefined>(ROUTE_RULE, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest<FastifyRequest>();

    if (!rule) {
      this.logger.error(`Refused ${request.method} ${request.url}: the route declares no rule`);
      throw new ForbiddenException('This route declares no access rule, so it is closed.');
    }
    if (rule.audience === 'public') return true;

    const session = await this.access.resolveSession(request.cookies?.[SESSION_COOKIE]);
    if (!session) throw new UnauthorizedException('Sign in to continue.');

    if (!SAFE_METHODS.has(request.method)) {
      const token = request.headers[CSRF_HEADER];
      if (typeof token !== 'string' || !sameToken(token, session.csrfToken)) {
        throw new ForbiddenException('The request did not carry the portal’s anti-forgery token.');
      }
    }
    request.portal = session;
    if (rule.audience === 'signed-in') return true;

    const { user } = session;
    const page = isPageRequest(request.url);
    const path = request.url.split('?')[0] ?? request.url;
    const attempted = page ? `open page ${path}` : `${rule.action} (${request.method} ${path})`;

    if (user.kind !== rule.audience) {
      await this.access.recordRefusal(user.kind, user.id, user.name, attempted);
      throw new ForbiddenException('You do not have access to this.');
    }
    if (rule.roles && !rule.roles.some((role) => user.roles.includes(role))) {
      await this.access.recordRefusal(user.kind, user.id, user.name, attempted);
      throw new ForbiddenException(`Only a ${rule.roles.join(' or ')} can ${rule.action}.`);
    }
    return true;
  }
}

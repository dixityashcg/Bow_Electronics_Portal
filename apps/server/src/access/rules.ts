import { SetMetadata } from '@nestjs/common';
import type { Role } from '@bow/shared';

/**
 * Who may call a route. Every route declares one; the global guard refuses a
 * route that declares none, so a route added without a rule is closed, not open
 * (architecture §4.2, T-06).
 */
export type RouteRule =
  | { audience: 'public' }
  | { audience: 'signed-in' }
  | {
      audience: 'internal' | 'reseller';
      /** When present, the internal user must hold at least one of these roles. */
      roles?: Role[];
      /** What the caller was attempting, in words, for the refused attempts record. */
      action: string;
    };

export const ROUTE_RULE = 'portal:route-rule';

export const Rule = (rule: RouteRule) => SetMetadata(ROUTE_RULE, rule);

/** A route anyone may call, signed in or not. */
export const Public = () => Rule({ audience: 'public' });

/** A route for any signed-in user, internal or reseller. */
export const SignedIn = () => Rule({ audience: 'signed-in' });

/** A route for internal users; with roles, only for users named to one of them. */
export const Internal = (action: string, ...roles: Role[]) =>
  Rule({ audience: 'internal', action, ...(roles.length > 0 ? { roles } : {}) });

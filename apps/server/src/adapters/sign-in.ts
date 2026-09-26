/**
 * The sign-in adapters (architecture §4.7, ADR-03). The portal asks them only
 * who someone is; what that person may do is decided by the access module.
 */
export type Audience = 'staff' | 'reseller';

export interface SignInClaims {
  subjectId: string;
  name: string;
  email: string;
  audience: Audience;
}

export interface SignInAdapter {
  /** Completes a sign-in, returning the claims the identity provider vouches for, or null. */
  completeSignIn(audience: Audience, subjectId: string): SignInClaims | null;
}

export const SIGN_IN = Symbol('SignInAdapter');

/**
 * Stage 1 stand-in: a fixed directory of fictional people, picked on
 * /dev/sign-in. Returns the same claims shape Entra ID and External ID return.
 * The directory is deliberately wider than the portal's internal users list
 * (Chris is a Bow employee the portal must refuse, T-05).
 */
export class LocalSignIn implements SignInAdapter {
  constructor(private readonly directory: readonly SignInClaims[]) {}

  list(): readonly SignInClaims[] {
    return this.directory;
  }

  completeSignIn(audience: Audience, subjectId: string): SignInClaims | null {
    return this.directory.find((p) => p.audience === audience && p.subjectId === subjectId) ?? null;
  }
}

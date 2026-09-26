import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import type { Role } from '@bow/shared';
import type { Clock } from '../adapters/clock.ts';
import type { SignInClaims } from '../adapters/sign-in.ts';
import type { Db, RefusedUserKind, SessionUserKind } from '../db/database.ts';
import { CLOCK, DB } from '../tokens.ts';

/** Session lifetimes (architecture N-11). */
const IDLE_LIMIT_MS = 60 * 60 * 1000;
const ABSOLUTE_LIMIT_MS: Record<SessionUserKind, number> = {
  internal: 10 * 60 * 60 * 1000,
  reseller: 12 * 60 * 60 * 1000,
};

export interface PortalUser {
  kind: SessionUserKind;
  id: number;
  name: string;
  /** For internal users, read fresh from role_assignment on every call (N-09, T-07). */
  roles: Role[];
  /** For reseller users. */
  resellerId: number | null;
  isAdmin: boolean;
}

export interface ResolvedSession {
  sessionId: string;
  csrfToken: string;
  user: PortalUser;
}

export type Admission =
  | { admitted: true; sessionId: string }
  | { admitted: false; reason: string };

@Injectable()
export class AccessService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  /**
   * Admits someone the identity provider has vouched for. A Bow account alone is
   * not enough: only people on the internal users list are admitted (T-05), and
   * a deactivated reseller user is not admitted (N-08). A refusal is recorded.
   */
  async admit(claims: SignInClaims): Promise<Admission> {
    if (claims.audience === 'staff') {
      const user = await this.db
        .selectFrom('internal_user')
        .select(['internal_user_id', 'is_active'])
        .where('entra_object_id', '=', claims.subjectId)
        .executeTakeFirst();
      if (!user || user.is_active !== 1) {
        await this.recordRefusal('staff not listed', null, `${claims.name} <${claims.email}>`, 'sign in to the internal side');
        return { admitted: false, reason: 'This Bow account is not on the portal’s internal users list.' };
      }
      return { admitted: true, sessionId: await this.createSession('internal', user.internal_user_id) };
    }
    const user = await this.db
      .selectFrom('reseller_user')
      .select(['reseller_user_id', 'is_active', 'name'])
      .where('external_id_object_id', '=', claims.subjectId)
      .executeTakeFirst();
    if (!user || user.is_active !== 1) {
      return { admitted: false, reason: 'This account cannot sign in to the portal.' };
    }
    return { admitted: true, sessionId: await this.createSession('reseller', user.reseller_user_id) };
  }

  private async createSession(kind: SessionUserKind, userId: number): Promise<string> {
    const sessionId = randomBytes(32).toString('base64url');
    const now = this.clock.now();
    await this.db
      .insertInto('session')
      .values({
        session_id: sessionId,
        user_kind: kind,
        user_id: userId,
        csrf_token: randomBytes(32).toString('base64url'),
        created_at: now,
        last_seen_at: now,
      })
      .execute();
    return sessionId;
  }

  /**
   * Finds the session and its user, checking on every call that the session
   * has not expired and the user is still active — never only at sign-in.
   */
  async resolveSession(sessionId: string | undefined): Promise<ResolvedSession | null> {
    if (!sessionId) return null;
    const session = await this.db.selectFrom('session').selectAll().where('session_id', '=', sessionId).executeTakeFirst();
    if (!session) return null;
    const now = this.clock.now();
    const nowMs = Date.parse(now);
    if (
      nowMs - Date.parse(session.last_seen_at) > IDLE_LIMIT_MS ||
      nowMs - Date.parse(session.created_at) > ABSOLUTE_LIMIT_MS[session.user_kind]
    ) {
      await this.endSession(sessionId);
      return null;
    }
    const user = await this.loadUser(session.user_kind, session.user_id);
    if (!user) {
      await this.endSession(sessionId);
      return null;
    }
    await this.db.updateTable('session').set({ last_seen_at: now }).where('session_id', '=', sessionId).execute();
    return { sessionId, csrfToken: session.csrf_token, user };
  }

  async endSession(sessionId: string): Promise<void> {
    await this.db.deleteFrom('session').where('session_id', '=', sessionId).execute();
  }

  private async loadUser(kind: SessionUserKind, id: number): Promise<PortalUser | null> {
    if (kind === 'internal') {
      const user = await this.db
        .selectFrom('internal_user')
        .select(['name', 'is_active'])
        .where('internal_user_id', '=', id)
        .executeTakeFirst();
      if (!user || user.is_active !== 1) return null;
      return { kind, id, name: user.name, roles: await this.rolesOf(id), resellerId: null, isAdmin: false };
    }
    const user = await this.db
      .selectFrom('reseller_user')
      .select(['name', 'is_active', 'reseller_id', 'is_admin'])
      .where('reseller_user_id', '=', id)
      .executeTakeFirst();
    if (!user || user.is_active !== 1) return null;
    return { kind, id, name: user.name, roles: [], resellerId: user.reseller_id, isAdmin: user.is_admin === 1 };
  }

  async rolesOf(internalUserId: number): Promise<Role[]> {
    const rows = await this.db
      .selectFrom('role_assignment')
      .select('role')
      .where('internal_user_id', '=', internalUserId)
      .where('revoked_at', 'is', null)
      .execute();
    return rows.map((r) => r.role);
  }

  /** Every refusal under BR-03 is kept: who, what they attempted, and when (story-01-04 c4). */
  async recordRefusal(kind: RefusedUserKind, userId: number | null, userLabel: string, action: string): Promise<void> {
    await this.db
      .insertInto('refused_attempt')
      .values({ user_kind: kind, user_id: userId, user_label: userLabel, action, at: this.clock.now() })
      .execute();
  }

  async listRefusals(limit = 200) {
    return this.db
      .selectFrom('refused_attempt')
      .select(['refused_attempt_id as id', 'user_kind as userKind', 'user_label as user', 'action', 'at'])
      .orderBy('refused_attempt_id', 'desc')
      .limit(limit)
      .execute();
  }
}

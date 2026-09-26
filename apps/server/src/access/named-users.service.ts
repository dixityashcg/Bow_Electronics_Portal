import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NAMEABLE_ROLES, type NameableRole, type Role } from '@bow/shared';
import type { Clock } from '../adapters/clock.ts';
import type { Db } from '../db/database.ts';
import { CLOCK, DB } from '../tokens.ts';

/**
 * The named-user lists (story-01-05). Only role managers change them (the
 * route rule), nobody can name themself (T-08), and each list is separate:
 * being on one grants nothing on the other.
 */
@Injectable()
export class NamedUsersService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async list() {
    const users = await this.db
      .selectFrom('internal_user')
      .select(['internal_user_id as id', 'name', 'email'])
      .where('is_active', '=', 1)
      .orderBy('name')
      .execute();
    const assignments = await this.db
      .selectFrom('role_assignment')
      .select(['internal_user_id', 'role'])
      .where('revoked_at', 'is', null)
      .execute();
    return {
      roles: NAMEABLE_ROLES,
      users: users.map((u) => ({
        ...u,
        roles: assignments.filter((a) => a.internal_user_id === u.id).map((a) => a.role as Role),
      })),
    };
  }

  async name(byUserId: number, targetUserId: number, role: NameableRole): Promise<void> {
    if (byUserId === targetUserId) {
      throw new ForbiddenException('Nobody can name themself. Another role manager must do it.');
    }
    await this.db.transaction().execute(async (trx) => {
      const target = await trx
        .selectFrom('internal_user')
        .select(['internal_user_id', 'is_active'])
        .where('internal_user_id', '=', targetUserId)
        .executeTakeFirst();
      if (!target || target.is_active !== 1) throw new NotFoundException('No active internal user with that id.');
      const existing = await trx
        .selectFrom('role_assignment')
        .select('revoked_at')
        .where('internal_user_id', '=', targetUserId)
        .where('role', '=', role)
        .executeTakeFirst();
      const now = this.clock.now();
      if (!existing) {
        await trx
          .insertInto('role_assignment')
          .values({ internal_user_id: targetUserId, role, granted_by: byUserId, granted_at: now, revoked_by: null, revoked_at: null })
          .execute();
      } else if (existing.revoked_at === null) {
        throw new ConflictException(`That user is already named ${role}.`);
      } else {
        // The earlier grant and its revocation are kept in role_assignment_history by the trigger.
        await trx
          .updateTable('role_assignment')
          .set({ granted_by: byUserId, granted_at: now, revoked_by: null, revoked_at: null })
          .where('internal_user_id', '=', targetUserId)
          .where('role', '=', role)
          .execute();
      }
    });
  }

  async remove(byUserId: number, targetUserId: number, role: NameableRole): Promise<void> {
    const result = await this.db
      .updateTable('role_assignment')
      .set({ revoked_by: byUserId, revoked_at: this.clock.now() })
      .where('internal_user_id', '=', targetUserId)
      .where('role', '=', role)
      .where('revoked_at', 'is', null)
      .executeTakeFirst();
    if (result.numUpdatedRows === 0n) throw new ConflictException(`That user is not named ${role}.`);
  }
}

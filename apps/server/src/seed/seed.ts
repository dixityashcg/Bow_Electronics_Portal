import type { Clock } from '../adapters/clock.ts';
import type { Db } from '../db/database.ts';
import { seedResellers, seedStaff } from './people.ts';

/**
 * Seeds an empty database with the fictional people, resellers and signed
 * standard discounts of architecture §4.8. The store is left empty: the
 * epic-01 demo loads the sample spreadsheet through the real load.
 */
export async function seed(db: Db, clock: Clock): Promise<void> {
  const existing = await db.selectFrom('internal_user').select('internal_user_id').executeTakeFirst();
  if (existing) throw new Error('The database is not empty. Run ./scripts/reset.sh to start from seed data.');

  await db.transaction().execute(async (trx) => {
    const now = clock.now();
    const ids = new Map<string, number>();
    for (const person of seedStaff.filter((s) => s.onInternalUsersList)) {
      const row = await trx
        .insertInto('internal_user')
        .values({ name: person.name, email: person.email, entra_object_id: person.subjectId, is_active: 1 })
        .returning('internal_user_id')
        .executeTakeFirstOrThrow();
      ids.set(person.subjectId, row.internal_user_id);
    }
    // Seeded roles are granted by nobody: in production the first role managers
    // are set in configuration at first deployment (architecture §10.4 runbook 3).
    for (const person of seedStaff) {
      for (const role of person.roles) {
        await trx
          .insertInto('role_assignment')
          .values({ internal_user_id: ids.get(person.subjectId)!, role, granted_by: null, granted_at: now, revoked_by: null, revoked_at: null })
          .execute();
      }
    }

    const lee = ids.get('local-staff-lee')!;
    for (const reseller of seedResellers) {
      const { reseller_id } = await trx.insertInto('reseller').values({ name: reseller.name }).returning('reseller_id').executeTakeFirstOrThrow();
      for (const user of reseller.users) {
        await trx
          .insertInto('reseller_user')
          .values({
            reseller_id,
            name: user.name,
            email: user.email,
            is_admin: user.isAdmin ? 1 : 0,
            is_active: 1,
            external_id_object_id: user.subjectId,
          })
          .execute();
      }
      if (reseller.standardDiscount !== null) {
        await trx.insertInto('standard_discount').values({ reseller_id, percent_hundredths: reseller.standardDiscount }).execute();
        await trx
          .insertInto('discount_change')
          .values({ reseller_id, old_percent: null, new_percent: reseller.standardDiscount, changed_by: lee, changed_at: now })
          .execute();
      }
    }
  });
}

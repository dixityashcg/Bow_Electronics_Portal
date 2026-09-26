import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { formatPercent, parsePercentText } from '@bow/shared';
import type { Clock } from '../adapters/clock.ts';
import type { Db } from '../db/database.ts';
import { CLOCK, DB } from '../tokens.ts';

/**
 * Standard discounts: one per reseller, with its history (A-07). epic-01 builds
 * only listing and the set action, which story-01-05 c3/c4 need to show that a
 * discount setter can set one and a removed one cannot (FDE decision,
 * 2026-09-26). story-04-01 builds the rest in epic-04.
 */
@Injectable()
export class DiscountService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async listResellers() {
    const rows = await this.db
      .selectFrom('reseller')
      .leftJoin('standard_discount', 'standard_discount.reseller_id', 'reseller.reseller_id')
      .select(['reseller.reseller_id as id', 'reseller.name', 'standard_discount.percent_hundredths'])
      .orderBy('reseller.name')
      .execute();
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      standardDiscount: r.percent_hundredths ?? null,
      standardDiscountText: r.percent_hundredths === null || r.percent_hundredths === undefined ? 'No standard discount' : formatPercent(r.percent_hundredths),
    }));
  }

  async setStandardDiscount(byUserId: number, resellerId: number, percentText: string) {
    const percent = parsePercentText(percentText);
    if (!percent.ok) throw new BadRequestException(`The discount was not changed: ${percent.reason}.`);
    await this.db.transaction().execute(async (trx) => {
      const reseller = await trx.selectFrom('reseller').select('reseller_id').where('reseller_id', '=', resellerId).executeTakeFirst();
      if (!reseller) throw new NotFoundException('No reseller with that id.');
      const current = await trx
        .selectFrom('standard_discount')
        .select('percent_hundredths')
        .where('reseller_id', '=', resellerId)
        .executeTakeFirst();
      const old = current?.percent_hundredths ?? null;
      if (old === percent.hundredths) {
        throw new ConflictException(`The standard discount is already ${formatPercent(old)}. Nothing was changed.`);
      }
      if (current) {
        await trx
          .updateTable('standard_discount')
          .set({ percent_hundredths: percent.hundredths })
          .where('reseller_id', '=', resellerId)
          .execute();
      } else {
        await trx.insertInto('standard_discount').values({ reseller_id: resellerId, percent_hundredths: percent.hundredths }).execute();
      }
      await trx
        .insertInto('discount_change')
        .values({ reseller_id: resellerId, old_percent: old, new_percent: percent.hundredths, changed_by: byUserId, changed_at: this.clock.now() })
        .execute();
    });
    return (await this.listResellers()).find((r) => r.id === resellerId)!;
  }

  async discountHistory(resellerId: number) {
    const rows = await this.db
      .selectFrom('discount_change')
      .innerJoin('internal_user', 'internal_user.internal_user_id', 'discount_change.changed_by')
      .select(['discount_change.old_percent', 'discount_change.new_percent', 'internal_user.name as changed_by', 'discount_change.changed_at'])
      .where('discount_change.reseller_id', '=', resellerId)
      .orderBy('discount_change.discount_change_id')
      .execute();
    return rows.map((r) => ({
      oldPercent: r.old_percent === null ? 'None' : formatPercent(r.old_percent),
      newPercent: formatPercent(r.new_percent),
      changedBy: r.changed_by,
      changedAt: r.changed_at,
    }));
  }
}

import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { sql, type Transaction } from 'kysely';
import { formatPrice, parsePriceText, type AddProductInput } from '@bow/shared';
import type { Clock } from '../adapters/clock.ts';
import type { Database, Db } from '../db/database.ts';
import { CLOCK, DB } from '../tokens.ts';
import type { ErpReadResult } from './erp-reader.ts';

export interface ProductView {
  id: number;
  partNumber: string;
  description: string;
  price: number;
  priceText: string;
  status: 'Open for quoting' | 'Closed';
}

type ProductRow = { product_id: number; part_number: string; description: string; price: number; open_for_quoting: number };

function view(row: ProductRow): ProductView {
  return {
    id: row.product_id,
    partNumber: row.part_number,
    description: row.description,
    price: row.price,
    priceText: formatPrice(row.price),
    status: row.open_for_quoting === 1 ? 'Open for quoting' : 'Closed',
  };
}

/** Plain words only: each is quoted, so search text is never read as full-text syntax (T-13). */
function ftsQuery(text: string): string | null {
  const words = text
    .split(/\s+/)
    .map((w) => w.replaceAll('"', ''))
    .filter((w) => /[\p{L}\p{N}]/u.test(w))
    .slice(0, 12);
  if (words.length === 0) return null;
  return words.map((w) => `"${w}"*`).join(' ');
}

/**
 * The catalog and pricing store (architecture §4.2). The system of record for
 * part data and price from go-live. Every product change writes the search
 * index in the same transaction.
 */
@Injectable()
export class CatalogService {
  constructor(
    @Inject(DB) private readonly db: Db,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  private async writeSearch(trx: Transaction<Database>, row: ProductRow, insert: boolean): Promise<void> {
    if (insert) {
      await sql`INSERT INTO product_search (rowid, product_id, part_number, description, open_for_quoting)
                VALUES (${row.product_id}, ${row.product_id}, ${row.part_number}, ${row.description}, ${row.open_for_quoting})`.execute(trx);
    } else {
      await sql`UPDATE product_search SET part_number = ${row.part_number}, description = ${row.description},
                open_for_quoting = ${row.open_for_quoting} WHERE rowid = ${row.product_id}`.execute(trx);
    }
  }

  async getProduct(id: number): Promise<ProductView> {
    const row = await this.db.selectFrom('product').selectAll().where('product_id', '=', id).executeTakeFirst();
    if (!row) throw new NotFoundException('No product with that id.');
    return view(row);
  }

  /** Looks a product up by its full part number, ignoring case and surrounding spaces. */
  async findByPartNumber(partNumber: string): Promise<ProductView | null> {
    const row = await this.db
      .selectFrom('product')
      .selectAll()
      .where('part_number', '=', partNumber.trim())
      .executeTakeFirst();
    return row ? view(row) : null;
  }

  /** Store search for internal users: part number or description words; closed products included. */
  async search(text: string, limit = 50): Promise<ProductView[]> {
    const trimmed = text.trim();
    if (trimmed === '') {
      const rows = await this.db.selectFrom('product').selectAll().orderBy('part_number').limit(limit).execute();
      return rows.map(view);
    }
    const exact = await this.findByPartNumber(trimmed);
    const query = ftsQuery(trimmed);
    const matched = query
      ? await sql<ProductRow>`SELECT p.product_id, p.part_number, p.description, p.price, p.open_for_quoting
            FROM product_search s JOIN product p ON p.product_id = s.rowid
            WHERE product_search MATCH ${query} ORDER BY p.part_number LIMIT ${limit}`
          .execute(this.db)
          .then((r) => r.rows.map(view))
      : [];
    const results = exact ? [exact, ...matched.filter((p) => p.id !== exact.id)] : matched;
    return results.slice(0, limit);
  }

  async addProduct(input: AddProductInput): Promise<ProductView> {
    const price = parsePriceText(input.price);
    if (!price.ok) throw new BadRequestException(`The price was not saved: ${price.reason}.`);
    return this.db.transaction().execute(async (trx) => {
      const existing = await trx
        .selectFrom('product')
        .select('product_id')
        .where('part_number', '=', input.partNumber)
        .executeTakeFirst();
      if (existing) throw new ConflictException(`A product with part number ${input.partNumber} is already in the store.`);
      const row = await trx
        .insertInto('product')
        .values({ part_number: input.partNumber, description: input.description, price: price.tenThousandths, open_for_quoting: 1 })
        .returningAll()
        .executeTakeFirstOrThrow();
      await this.writeSearch(trx, row, true);
      return view(row);
    });
  }

  /** Changes a price and adds one line to its history (story-01-02 c2). */
  async changePrice(byUserId: number, productId: number, priceText: string): Promise<ProductView> {
    const price = parsePriceText(priceText);
    if (!price.ok) throw new BadRequestException(`The price was not changed: ${price.reason}.`);
    return this.db.transaction().execute(async (trx) => {
      const current = await trx.selectFrom('product').selectAll().where('product_id', '=', productId).executeTakeFirst();
      if (!current) throw new NotFoundException('No product with that id.');
      if (current.price === price.tenThousandths) {
        throw new ConflictException(`The price is already ${formatPrice(current.price)}. Nothing was changed.`);
      }
      const updated = await trx
        .updateTable('product')
        .set({ price: price.tenThousandths })
        .where('product_id', '=', productId)
        .returningAll()
        .executeTakeFirstOrThrow();
      await trx
        .insertInto('price_change')
        .values({
          product_id: productId,
          old_price: current.price,
          new_price: price.tenThousandths,
          changed_by: byUserId,
          changed_at: this.clock.now(),
        })
        .execute();
      return view(updated);
    });
  }

  /** Closes a product for quoting (story-01-03). Search excludes it at once, from the same transaction. */
  async close(productId: number): Promise<ProductView> {
    return this.db.transaction().execute(async (trx) => {
      const current = await trx.selectFrom('product').selectAll().where('product_id', '=', productId).executeTakeFirst();
      if (!current) throw new NotFoundException('No product with that id.');
      if (current.open_for_quoting === 0) throw new ConflictException('This product is already closed for quoting.');
      const updated = await trx
        .updateTable('product')
        .set({ open_for_quoting: 0 })
        .where('product_id', '=', productId)
        .returningAll()
        .executeTakeFirstOrThrow();
      await this.writeSearch(trx, updated, false);
      return view(updated);
    });
  }

  /** Oldest first (story-01-02 c3). */
  async priceHistory(productId: number) {
    await this.getProduct(productId);
    const rows = await this.db
      .selectFrom('price_change')
      .innerJoin('internal_user', 'internal_user.internal_user_id', 'price_change.changed_by')
      .select([
        'price_change.old_price',
        'price_change.new_price',
        'internal_user.name as changed_by',
        'price_change.changed_at',
      ])
      .where('price_change.product_id', '=', productId)
      .orderBy('price_change.changed_at')
      .orderBy('price_change.price_change_id')
      .execute();
    return rows.map((r) => ({
      oldPrice: formatPrice(r.old_price),
      newPrice: formatPrice(r.new_price),
      changedBy: r.changed_by,
      changedAt: r.changed_at,
    }));
  }

  /**
   * The one-off ERP load (story-01-01). Refused on a store that holds any
   * product, so it can never overwrite prices maintained since (T-15). The
   * check and the load are one transaction.
   */
  async load(byUserId: number, fileName: string, read: ErpReadResult) {
    const loadRunId = await this.db.transaction().execute(async (trx) => {
      const held = await trx.selectFrom('product').select(sql<number>`count(*)`.as('n')).executeTakeFirstOrThrow();
      if (Number(held.n) > 0) {
        throw new ConflictException(
          `The store already holds ${held.n} products, so the ERP load was refused and nothing changed. The load runs once, into an empty store.`,
        );
      }
      for (const row of read.loadable) {
        const inserted = await trx
          .insertInto('product')
          .values({ part_number: row.partNumber, description: row.description, price: row.price, open_for_quoting: 1 })
          .returningAll()
          .executeTakeFirstOrThrow();
        await this.writeSearch(trx, inserted, true);
      }
      const run = await trx
        .insertInto('erp_load_run')
        .values({
          file_name: fileName,
          rows_read: read.rowsRead,
          rows_loaded: read.loadable.length,
          complete: read.rejected.length === 0 ? 1 : 0,
          run_by: byUserId,
          run_at: this.clock.now(),
        })
        .returning('load_run_id')
        .executeTakeFirstOrThrow();
      for (const rejected of read.rejected) {
        await trx
          .insertInto('erp_load_rejected_row')
          .values({
            load_run_id: run.load_run_id,
            row_number: rejected.rowNumber,
            raw_part_number: rejected.rawPartNumber,
            raw_price: rejected.rawPrice,
            reason: rejected.reason,
          })
          .execute();
      }
      return run.load_run_id;
    });
    return this.loadSummary(loadRunId);
  }

  /** The load summary (story-01-01): rows in the ERP, loaded, and each row not loaded with its reason. */
  async loadSummary(loadRunId?: number) {
    let query = this.db
      .selectFrom('erp_load_run')
      .innerJoin('internal_user', 'internal_user.internal_user_id', 'erp_load_run.run_by')
      .select([
        'erp_load_run.load_run_id',
        'erp_load_run.file_name',
        'erp_load_run.rows_read',
        'erp_load_run.rows_loaded',
        'erp_load_run.complete',
        'erp_load_run.run_at',
        'internal_user.name as run_by',
      ]);
    query = loadRunId === undefined ? query.orderBy('erp_load_run.load_run_id', 'desc') : query.where('erp_load_run.load_run_id', '=', loadRunId);
    const run = await query.executeTakeFirst();
    if (!run) return null;
    const rejected = await this.db
      .selectFrom('erp_load_rejected_row')
      .select(['row_number as rowNumber', 'raw_part_number as partNumber', 'raw_price as price', 'reason'])
      .where('load_run_id', '=', run.load_run_id)
      .orderBy('row_number')
      .execute();
    // Complete only when nothing was left behind (story-01-01 c5). The page shows statusText as written.
    const complete = run.complete === 1 && rejected.length === 0;
    const statusText = complete
      ? `Load complete: all ${run.rows_read} product rows in the ERP were loaded.`
      : `Load not complete: ${rejected.length} of ${run.rows_read} product rows in the ERP were not loaded. Each is listed below with its reason.`;
    return {
      loadRunId: run.load_run_id,
      fileName: run.file_name,
      runBy: run.run_by,
      runAt: run.run_at,
      rowsInErp: run.rows_read,
      rowsLoaded: run.rows_loaded,
      rowsNotLoaded: rejected.length,
      complete,
      statusText,
      notLoaded: rejected,
    };
  }
}

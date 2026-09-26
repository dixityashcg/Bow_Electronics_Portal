import BetterSqlite3 from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { Kysely, SqliteDialect, type Generated } from 'kysely';
import type { Role } from '@bow/shared';
import { migrations } from './migrations.ts';

export interface InternalUserTable {
  internal_user_id: Generated<number>;
  name: string;
  email: string;
  entra_object_id: string;
  is_active: number;
}

export interface RoleAssignmentTable {
  internal_user_id: number;
  role: Role;
  granted_by: number | null;
  granted_at: string;
  revoked_by: number | null;
  revoked_at: string | null;
}

export interface ResellerTable {
  reseller_id: Generated<number>;
  name: string;
}

export interface ResellerUserTable {
  reseller_user_id: Generated<number>;
  reseller_id: number;
  name: string;
  email: string;
  is_admin: number;
  is_active: number;
  external_id_object_id: string | null;
}

export type RefusedUserKind = 'internal' | 'reseller' | 'staff not listed';

export interface RefusedAttemptTable {
  refused_attempt_id: Generated<number>;
  user_kind: RefusedUserKind;
  user_id: number | null;
  user_label: string;
  action: string;
  at: string;
}

export type SessionUserKind = 'internal' | 'reseller';

export interface SessionTable {
  session_id: string;
  user_kind: SessionUserKind;
  user_id: number;
  csrf_token: string;
  created_at: string;
  last_seen_at: string;
}

export interface ProductTable {
  product_id: Generated<number>;
  part_number: string;
  description: string;
  price: number;
  open_for_quoting: number;
}

export interface ProductSearchTable {
  product_id: number;
  part_number: string;
  description: string;
  open_for_quoting: number;
}

export interface PriceChangeTable {
  price_change_id: Generated<number>;
  product_id: number;
  old_price: number;
  new_price: number;
  changed_by: number;
  changed_at: string;
}

export interface ErpLoadRunTable {
  load_run_id: Generated<number>;
  file_name: string;
  rows_read: number;
  rows_loaded: number;
  complete: number;
  run_by: number;
  run_at: string;
}

export interface ErpLoadRejectedRowTable {
  load_run_id: number;
  row_number: number;
  raw_part_number: string | null;
  raw_price: string | null;
  reason: string;
}

export interface StandardDiscountTable {
  reseller_id: number;
  percent_hundredths: number | null;
}

export interface DiscountChangeTable {
  discount_change_id: Generated<number>;
  reseller_id: number;
  old_percent: number | null;
  new_percent: number;
  changed_by: number;
  changed_at: string;
}

export interface Database {
  internal_user: InternalUserTable;
  role_assignment: RoleAssignmentTable;
  reseller: ResellerTable;
  reseller_user: ResellerUserTable;
  refused_attempt: RefusedAttemptTable;
  session: SessionTable;
  product: ProductTable;
  product_search: ProductSearchTable;
  price_change: PriceChangeTable;
  erp_load_run: ErpLoadRunTable;
  erp_load_rejected_row: ErpLoadRejectedRowTable;
  standard_discount: StandardDiscountTable;
  discount_change: DiscountChangeTable;
}

export type Db = Kysely<Database>;

export interface OpenedDatabase {
  db: Db;
  /** The raw handle, for migrations and for tests that attack the triggers directly. */
  raw: BetterSqlite3.Database;
}

/** Opens (creating if absent) the Stage 1 database file and brings it to the latest migration. */
export function openDatabase(file: string): OpenedDatabase {
  if (file !== ':memory:') mkdirSync(dirname(file), { recursive: true });
  const raw = new BetterSqlite3(file);
  raw.pragma('journal_mode = WAL');
  raw.pragma('foreign_keys = ON');
  migrate(raw);
  const db = new Kysely<Database>({ dialect: new SqliteDialect({ database: raw }) });
  return { db, raw };
}

function migrate(raw: BetterSqlite3.Database): void {
  raw.exec(`CREATE TABLE IF NOT EXISTS schema_migration (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`);
  const applied = new Set(
    raw.prepare('SELECT id FROM schema_migration').all().map((row) => (row as { id: string }).id),
  );
  for (const migration of migrations) {
    if (applied.has(migration.id)) continue;
    raw.transaction(() => {
      raw.exec(migration.sql);
      raw.prepare('INSERT INTO schema_migration (id, applied_at) VALUES (?, ?)').run(migration.id, new Date().toISOString());
    })();
  }
}

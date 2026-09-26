/**
 * SQLite migrations for Stage 1 (architecture §5.6).
 *
 * The rules the database enforces on Azure SQL with ledger tables are written
 * here as triggers:
 * - an append-only table refuses every UPDATE and DELETE;
 * - an updatable table copies the old row into its `*_history` table before
 *   each UPDATE, and refuses DELETE (nothing in the portal deletes a record).
 *
 * Migrations only ever add (architecture §4.6). A migration, once committed,
 * is never edited: a change is a new migration.
 */

export interface Migration {
  id: string;
  sql: string;
}

function appendOnly(table: string): string {
  return `
CREATE TRIGGER ${table}_no_update BEFORE UPDATE ON ${table}
BEGIN SELECT RAISE(ABORT, '${table} is append-only: rows cannot be updated'); END;
CREATE TRIGGER ${table}_no_delete BEFORE DELETE ON ${table}
BEGIN SELECT RAISE(ABORT, '${table} is append-only: rows cannot be deleted'); END;
`;
}

/** Keeps every earlier version of an updatable row (the SQLite stand-in for an updatable ledger table). */
function updatableWithHistory(table: string, columns: string[]): string {
  const cols = columns.join(', ');
  const oldCols = columns.map((c) => `OLD.${c}`).join(', ');
  return `
CREATE TRIGGER ${table}_keep_history BEFORE UPDATE ON ${table}
BEGIN
  INSERT INTO ${table}_history (${cols}, superseded_at)
  VALUES (${oldCols}, strftime('%Y-%m-%dT%H:%M:%fZ', 'now'));
END;
CREATE TRIGGER ${table}_no_delete BEFORE DELETE ON ${table}
BEGIN SELECT RAISE(ABORT, '${table} rows cannot be deleted'); END;
${appendOnly(`${table}_history`)}
`;
}

export const migrations: Migration[] = [
  {
    id: '0001-access',
    sql: `
CREATE TABLE internal_user (
  internal_user_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  entra_object_id TEXT NOT NULL UNIQUE,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1))
);
CREATE TABLE internal_user_history (
  history_id INTEGER PRIMARY KEY,
  internal_user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  entra_object_id TEXT NOT NULL,
  is_active INTEGER NOT NULL,
  superseded_at TEXT NOT NULL
);
${updatableWithHistory('internal_user', ['internal_user_id', 'name', 'email', 'entra_object_id', 'is_active'])}

CREATE TABLE role_assignment (
  internal_user_id INTEGER NOT NULL REFERENCES internal_user (internal_user_id),
  role TEXT NOT NULL CHECK (role IN ('price maintainer', 'discount setter', 'internal admin', 'role manager')),
  granted_by INTEGER REFERENCES internal_user (internal_user_id),
  granted_at TEXT NOT NULL,
  revoked_by INTEGER REFERENCES internal_user (internal_user_id),
  revoked_at TEXT,
  PRIMARY KEY (internal_user_id, role)
);
CREATE TABLE role_assignment_history (
  history_id INTEGER PRIMARY KEY,
  internal_user_id INTEGER NOT NULL,
  role TEXT NOT NULL,
  granted_by INTEGER,
  granted_at TEXT NOT NULL,
  revoked_by INTEGER,
  revoked_at TEXT,
  superseded_at TEXT NOT NULL
);
${updatableWithHistory('role_assignment', ['internal_user_id', 'role', 'granted_by', 'granted_at', 'revoked_by', 'revoked_at'])}

CREATE TABLE reseller (
  reseller_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE reseller_history (
  history_id INTEGER PRIMARY KEY,
  reseller_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  superseded_at TEXT NOT NULL
);
${updatableWithHistory('reseller', ['reseller_id', 'name'])}

CREATE TABLE reseller_user (
  reseller_user_id INTEGER PRIMARY KEY,
  reseller_id INTEGER NOT NULL REFERENCES reseller (reseller_id),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  is_admin INTEGER NOT NULL DEFAULT 0 CHECK (is_admin IN (0, 1)),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  external_id_object_id TEXT UNIQUE
);
CREATE TABLE reseller_user_history (
  history_id INTEGER PRIMARY KEY,
  reseller_user_id INTEGER NOT NULL,
  reseller_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_admin INTEGER NOT NULL,
  is_active INTEGER NOT NULL,
  external_id_object_id TEXT,
  superseded_at TEXT NOT NULL
);
${updatableWithHistory('reseller_user', ['reseller_user_id', 'reseller_id', 'name', 'email', 'is_admin', 'is_active', 'external_id_object_id'])}

-- Every refusal under BR-03 (story-01-04 c4). user_label keeps who it was in
-- words, because a refused sign-in (T-05) has no portal user id to point at.
CREATE TABLE refused_attempt (
  refused_attempt_id INTEGER PRIMARY KEY,
  user_kind TEXT NOT NULL CHECK (user_kind IN ('internal', 'reseller', 'staff not listed')),
  user_id INTEGER,
  user_label TEXT NOT NULL,
  action TEXT NOT NULL,
  at TEXT NOT NULL
);
${appendOnly('refused_attempt')}

CREATE TABLE session (
  session_id TEXT PRIMARY KEY,
  user_kind TEXT NOT NULL CHECK (user_kind IN ('internal', 'reseller')),
  user_id INTEGER NOT NULL,
  csrf_token TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL
);
`,
  },
  {
    id: '0002-catalog',
    sql: `
CREATE TABLE product (
  product_id INTEGER PRIMARY KEY,
  part_number TEXT NOT NULL UNIQUE COLLATE NOCASE,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  open_for_quoting INTEGER NOT NULL DEFAULT 1 CHECK (open_for_quoting IN (0, 1))
);
CREATE TABLE product_history (
  history_id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  part_number TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  open_for_quoting INTEGER NOT NULL,
  superseded_at TEXT NOT NULL
);
${updatableWithHistory('product', ['product_id', 'part_number', 'description', 'price', 'open_for_quoting'])}

-- The search index. An ordinary table on Azure SQL (ledger tables cannot carry
-- a full-text index); FTS5 here. Written in the same transaction as every
-- product change, and never read for a price (architecture §5.1).
CREATE VIRTUAL TABLE product_search USING fts5 (
  product_id UNINDEXED,
  part_number,
  description,
  open_for_quoting UNINDEXED,
  tokenize = 'unicode61'
);

CREATE TABLE price_change (
  price_change_id INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES product (product_id),
  old_price INTEGER NOT NULL,
  new_price INTEGER NOT NULL,
  changed_by INTEGER NOT NULL REFERENCES internal_user (internal_user_id),
  changed_at TEXT NOT NULL
);
${appendOnly('price_change')}

CREATE TABLE erp_load_run (
  load_run_id INTEGER PRIMARY KEY,
  file_name TEXT NOT NULL,
  rows_read INTEGER NOT NULL,
  rows_loaded INTEGER NOT NULL,
  complete INTEGER NOT NULL CHECK (complete IN (0, 1)),
  run_by INTEGER NOT NULL REFERENCES internal_user (internal_user_id),
  run_at TEXT NOT NULL
);
${appendOnly('erp_load_run')}

CREATE TABLE erp_load_rejected_row (
  load_run_id INTEGER NOT NULL REFERENCES erp_load_run (load_run_id),
  row_number INTEGER NOT NULL,
  raw_part_number TEXT,
  raw_price TEXT,
  reason TEXT NOT NULL,
  PRIMARY KEY (load_run_id, row_number)
);
${appendOnly('erp_load_rejected_row')}

-- One standard discount per reseller (story-04-01; A-07). epic-01 builds only
-- the set action story-01-05 c3/c4 need (FDE decision, 2026-09-26).
CREATE TABLE standard_discount (
  reseller_id INTEGER PRIMARY KEY REFERENCES reseller (reseller_id),
  percent_hundredths INTEGER CHECK (percent_hundredths BETWEEN 0 AND 10000)
);
CREATE TABLE standard_discount_history (
  history_id INTEGER PRIMARY KEY,
  reseller_id INTEGER NOT NULL,
  percent_hundredths INTEGER,
  superseded_at TEXT NOT NULL
);
${updatableWithHistory('standard_discount', ['reseller_id', 'percent_hundredths'])}

CREATE TABLE discount_change (
  discount_change_id INTEGER PRIMARY KEY,
  reseller_id INTEGER NOT NULL REFERENCES reseller (reseller_id),
  old_percent INTEGER,
  new_percent INTEGER NOT NULL,
  changed_by INTEGER NOT NULL REFERENCES internal_user (internal_user_id),
  changed_at TEXT NOT NULL
);
${appendOnly('discount_change')}
`,
  },
];

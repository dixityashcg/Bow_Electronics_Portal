import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { PAT, startPortal, workbook, type Portal } from './harness.ts';

/**
 * Database contract tests for Stage 1 (architecture §5.6): the rules the
 * database itself enforces, attacked directly rather than through the portal.
 */

const APPEND_ONLY = [
  'price_change',
  'erp_load_run',
  'erp_load_rejected_row',
  'discount_change',
  'refused_attempt',
  'product_history',
  'role_assignment_history',
  'standard_discount_history',
];
const NO_DELETE = ['product', 'internal_user', 'role_assignment', 'reseller', 'reseller_user', 'standard_discount'];

describe('rules the database enforces', () => {
  let portal: Portal;

  beforeAll(async () => {
    portal = await startPortal();
    const pat = await portal.signIn(PAT);
    await pat.upload('/api/sales/store/load', 'erp.xlsx', await workbook([['BWE-A', 'Alpha resistor', 1], ['BWE-B', 'Beta capacitor', '$2']]));
    const product = (await pat.get('/api/sales/store/part-numbers/BWE-A')).json;
    await pat.post(`/api/sales/store/products/${product.id}/price`, { price: '1.50' });
    await pat.post(`/api/sales/store/products/${product.id}/close`);
    await pat.post('/api/sales/store/products', { partNumber: 'BWE-C', description: 'Gamma crystal', price: '3' });
    await (await portal.signIn('local-reseller-a-casey')).get('/sales/store');
    const morgan = await portal.signIn('local-staff-morgan');
    const samId = await portal.internalUserId('local-staff-sam');
    await morgan.post('/api/sales/named-users', { internalUserId: samId, role: 'price maintainer' });
    await morgan.delete(`/api/sales/named-users/${samId}/price%20maintainer`);
    await portal.raw.prepare("UPDATE standard_discount SET percent_hundredths = 900 WHERE reseller_id = (SELECT reseller_id FROM reseller WHERE name = 'Demo Reseller E')").run();
  });
  afterAll(async () => {
    await portal?.close();
  });

  test.each(APPEND_ONLY)('%s refuses every update and delete', (table) => {
    const count = (portal.raw.prepare(`SELECT count(*) AS n FROM ${table}`).get() as any).n;
    expect(count, `${table} has rows to attack`).toBeGreaterThan(0);
    expect(() => portal.raw.prepare(`UPDATE ${table} SET rowid = rowid`).run()).toThrow(/append-only/);
    expect(() => portal.raw.prepare(`DELETE FROM ${table}`).run()).toThrow(/append-only/);
  });

  test.each(NO_DELETE)('%s refuses delete', (table) => {
    expect(() => portal.raw.prepare(`DELETE FROM ${table}`).run()).toThrow(/cannot be deleted/);
  });

  test('an updated product keeps its earlier version', () => {
    const history = portal.raw.prepare("SELECT price, open_for_quoting FROM product_history WHERE part_number = 'BWE-A' ORDER BY history_id").all();
    expect(history).toEqual([
      { price: 10_000, open_for_quoting: 1 },
      { price: 15_000, open_for_quoting: 1 },
    ]);
  });

  test('the search index matches the store after every store operation', () => {
    const products = portal.raw.prepare('SELECT product_id, part_number, description, open_for_quoting FROM product ORDER BY product_id').all();
    const indexed = portal.raw
      .prepare('SELECT rowid AS product_id, part_number, description, open_for_quoting FROM product_search ORDER BY rowid')
      .all();
    expect(indexed).toEqual(products);
  });

  test('two products cannot share a part number, whatever the case', () => {
    expect(() => portal.raw.prepare("INSERT INTO product (part_number, description, price) VALUES ('bwe-c', 'x', 1)").run()).toThrow(/UNIQUE/);
  });

  test('a price must be positive', () => {
    expect(() => portal.raw.prepare("INSERT INTO product (part_number, description, price) VALUES ('BWE-FREE', 'x', 0)").run()).toThrow(/CHECK/);
  });
});

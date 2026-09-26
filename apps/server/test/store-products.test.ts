import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { PAT, startPortal, type Client, type Portal } from './harness.ts';

/** story-01-02 (add a product, change a price, keep the history) and story-01-03 (close for quoting). */

const PRODUCTS = '/api/sales/store/products';
const lookup = (pn: string) => `/api/sales/store/part-numbers/${encodeURIComponent(pn)}`;

describe('adding products and changing prices', () => {
  let portal: Portal;
  let pat: Client;

  beforeAll(async () => {
    portal = await startPortal();
    pat = await portal.signIn(PAT);
  });
  afterAll(async () => {
    await portal?.close();
  });

  async function add(partNumber: string, price: string, description = 'Capacitor, ceramic, 1 µF, 25 V, X7R, 0603') {
    const response = await pat.post(PRODUCTS, { partNumber, description, price });
    expect(response.status, response.body).toBe(201);
    return response.json;
  }

  test('[story-01-02#1] a product added with a part number, description and price can be found by its part number', async () => {
    const added = await add('BWE-C0603X7R105K-NEW', '0.0125');
    expect(added).toMatchObject({ partNumber: 'BWE-C0603X7R105K-NEW', price: 125, priceText: '0.0125', status: 'Open for quoting' });
    const found = await pat.get(lookup('BWE-C0603X7R105K-NEW'));
    expect(found.status).toBe(200);
    expect(found.json).toMatchObject({ id: added.id, description: 'Capacitor, ceramic, 1 µF, 25 V, X7R, 0603', price: 125 });
    // Store search finds it by part number and by a description word.
    const byPart = await pat.get(`${PRODUCTS}?q=${encodeURIComponent('BWE-C0603X7R105K-NEW')}`);
    expect(byPart.json.map((p: any) => p.id)).toContain(added.id);
    const byWord = await pat.get(`${PRODUCTS}?q=ceramic`);
    expect(byWord.json.map((p: any) => p.id)).toContain(added.id);
  });

  test('[story-01-02#1] a second product with the same part number, in any case, is refused, and so is a price that is not a plain positive number', async () => {
    await add('BWE-UNIQUE-1', '1.00');
    const duplicate = await pat.post(PRODUCTS, { partNumber: 'bwe-unique-1', description: 'Another', price: '2.00' });
    expect(duplicate.status).toBe(409);
    for (const price of ['$5', '0', '-1', '1,000.00', '1.23456', '', 'abc']) {
      const refused = await pat.post(PRODUCTS, { partNumber: `BWE-BADPRICE-${price.length}-${price}`, description: 'Bad price', price });
      expect(refused.status, `price ${JSON.stringify(price)}`).toBe(400);
    }
    const noDescription = await pat.post(PRODUCTS, { partNumber: 'BWE-NODESC', description: '  ', price: '1' });
    expect(noDescription.status).toBe(400);
    expect((await pat.get(lookup('BWE-NODESC'))).status).toBe(404);
  });

  test('[story-01-02#2] changing a price from 10.00 to 12.00 adds one history line: old price, new price, who, and when', async () => {
    const product = await add('BWE-HISTORY-ONE', '10.00');
    const before = new Date().toISOString();
    const changed = await pat.post(`${PRODUCTS}/${product.id}/price`, { price: '12.00' });
    expect(changed.status, changed.body).toBe(201);
    expect(changed.json).toMatchObject({ price: 120_000, priceText: '12.00' });
    const after = new Date().toISOString();
    const history = await pat.get(`${PRODUCTS}/${product.id}/price-history`);
    expect(history.json).toHaveLength(1);
    const [line] = history.json;
    expect(line).toMatchObject({ oldPrice: '10.00', newPrice: '12.00', changedBy: 'Pat (rep)' });
    expect(line.changedAt >= before && line.changedAt <= after).toBe(true);
    expect((await pat.get(lookup('BWE-HISTORY-ONE'))).json.price).toBe(120_000);
  });

  test('[story-01-02#2] a change to the same price, or to an invalid price, adds no history line', async () => {
    const product = await add('BWE-HISTORY-NONE', '5.00');
    expect((await pat.post(`${PRODUCTS}/${product.id}/price`, { price: '5.00' })).status).toBe(409);
    expect((await pat.post(`${PRODUCTS}/${product.id}/price`, { price: '5,50' })).status).toBe(400);
    expect((await pat.get(`${PRODUCTS}/${product.id}/price-history`)).json).toHaveLength(0);
    expect((await pat.post(`${PRODUCTS}/999999/price`, { price: '5.50' })).status).toBe(404);
  });

  test('[story-01-02#3] a price changed three times shows three history lines, oldest first', async () => {
    const product = await add('BWE-HISTORY-THREE', '10.00');
    // Each change ten minutes apart on the local clock (inside the 60-minute idle limit, N-11),
    // so the order is by time and not only by insertion.
    for (const [i, price] of ['11.00', '9.50', '12.25'].entries()) {
      portal.clock.setOffsetMs(i * 10 * 60 * 1000);
      expect((await pat.post(`${PRODUCTS}/${product.id}/price`, { price })).status).toBe(201);
    }
    portal.clock.setOffsetMs(0);
    const history = await pat.get(`${PRODUCTS}/${product.id}/price-history`);
    expect(history.json.map((l: any) => [l.oldPrice, l.newPrice])).toEqual([
      ['10.00', '11.00'],
      ['11.00', '9.50'],
      ['9.50', '12.25'],
    ]);
    const times = history.json.map((l: any) => l.changedAt);
    expect([...times].sort()).toEqual(times);
  });

  test('[story-01-02#3] a price history line cannot be changed or removed, even directly in the database', async () => {
    const product = await add('BWE-HISTORY-KEPT', '1.00');
    await pat.post(`${PRODUCTS}/${product.id}/price`, { price: '2.00' });
    expect(() => portal.raw.prepare('UPDATE price_change SET new_price = 1 WHERE product_id = ?').run(product.id)).toThrow(/append-only/);
    expect(() => portal.raw.prepare('DELETE FROM price_change WHERE product_id = ?').run(product.id)).toThrow(/append-only/);
    expect((await pat.get(`${PRODUCTS}/${product.id}/price-history`)).json).toHaveLength(1);
  });
});

describe('closing a product for quoting', () => {
  let portal: Portal;
  let pat: Client;

  beforeAll(async () => {
    portal = await startPortal();
    pat = await portal.signIn(PAT);
  });
  afterAll(async () => {
    await portal?.close();
  });

  test('[story-01-03#1] a product open for quoting, once closed, shows its status as Closed', async () => {
    const product = (await pat.post(PRODUCTS, { partNumber: 'BWE-TO-CLOSE', description: 'Diode, Schottky, SMA', price: '0.12' })).json;
    expect(product.status).toBe('Open for quoting');
    const closed = await pat.post(`${PRODUCTS}/${product.id}/close`);
    expect(closed.status, closed.body).toBe(201);
    expect(closed.json.status).toBe('Closed');
    expect((await pat.get(`${PRODUCTS}/${product.id}`)).json.status).toBe('Closed');
    // The search index learns it in the same transaction, and the earlier state is kept.
    const indexed = portal.raw.prepare('SELECT open_for_quoting FROM product_search WHERE rowid = ?').get(product.id) as any;
    expect(indexed.open_for_quoting).toBe(0);
    const kept = portal.raw.prepare('SELECT open_for_quoting FROM product_history WHERE product_id = ?').all(product.id) as any[];
    expect(kept.map((r) => r.open_for_quoting)).toContain(1);
  });

  test('[story-01-03#1] closing a product already closed is refused, and it stays Closed', async () => {
    const product = (await pat.post(PRODUCTS, { partNumber: 'BWE-CLOSE-TWICE', description: 'Crystal', price: '0.30' })).json;
    expect((await pat.post(`${PRODUCTS}/${product.id}/close`)).status).toBe(201);
    expect((await pat.post(`${PRODUCTS}/${product.id}/close`)).status).toBe(409);
    expect((await pat.get(`${PRODUCTS}/${product.id}`)).json.status).toBe('Closed');
  });
});

import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { CASEY, INDEX_HTML, JO, PAT, SAM, startPortal, type Client, type Portal } from './harness.ts';

/** story-01-04 — Refuse a price change from anyone not named to make it. */

const PRODUCTS = '/api/sales/store/products';

describe('store changes are refused to anyone not named', () => {
  let portal: Portal;
  let pat: Client;
  let sam: Client;
  let casey: Client;
  let productId: number;

  beforeAll(async () => {
    portal = await startPortal();
    pat = await portal.signIn(PAT);
    sam = await portal.signIn(SAM);
    casey = await portal.signIn(CASEY);
    const added = await pat.post(PRODUCTS, { partNumber: 'BWE-GUARDED-1', description: 'Resistor, thick film, 10 kΩ, 1 %, 0402', price: '10.00' });
    productId = added.json.id;
  });
  afterAll(async () => {
    await portal?.close();
  });

  const priceNow = async () => (await pat.get(`${PRODUCTS}/${productId}`)).json.price as number;
  const count = async () => Number((portal.raw.prepare('SELECT count(*) AS n FROM product').get() as any).n);

  test('[story-01-04#1] a rep not named to maintain prices is refused a price change, and the price is unchanged', async () => {
    const refused = await sam.post(`${PRODUCTS}/${productId}/price`, { price: '99.00' });
    expect(refused.status).toBe(403);
    expect(await priceNow()).toBe(100_000);
    expect((await pat.get(`${PRODUCTS}/${productId}/price-history`)).json).toHaveLength(0);
  });

  test('[story-01-04#2] a rep not named is refused adding a product and closing one, and the store is unchanged', async () => {
    const before = await count();
    const add = await sam.post(PRODUCTS, { partNumber: 'BWE-SAM-ADDS', description: 'Should not exist', price: '1.00' });
    expect(add.status).toBe(403);
    expect(await count()).toBe(before);
    expect((await pat.get(`/api/sales/store/part-numbers/BWE-SAM-ADDS`)).status).toBe(404);
    const close = await sam.post(`${PRODUCTS}/${productId}/close`);
    expect(close.status).toBe(403);
    expect((await pat.get(`${PRODUCTS}/${productId}`)).json.status).toBe('Open for quoting');
  });

  test('[story-01-04#3] a reseller user is refused every page of the catalog and pricing store', async () => {
    for (const page of ['/sales/store', '/sales/store/load-summary', `/sales/store/products/${productId}`, '/sales/store/products/new', '/sales']) {
      const response = await casey.get(page);
      expect(response.status, page).toBe(403);
      expect(response.body, page).not.toContain(INDEX_HTML);
      expect(response.body, page).toContain('Access refused');
    }
  });

  test('[story-01-04#3] a reseller user is refused every store interface route, reads included', async () => {
    const calls: [string, () => Promise<{ status: number }>][] = [
      ['search', () => casey.get(`${PRODUCTS}?q=resistor`)],
      ['product', () => casey.get(`${PRODUCTS}/${productId}`)],
      ['part number', () => casey.get('/api/sales/store/part-numbers/BWE-GUARDED-1')],
      ['history', () => casey.get(`${PRODUCTS}/${productId}/price-history`)],
      ['summary', () => casey.get('/api/sales/store/load-summary')],
      ['price', () => casey.post(`${PRODUCTS}/${productId}/price`, { price: '1.00' })],
      ['add', () => casey.post(PRODUCTS, { partNumber: 'BWE-CASEY', description: 'x', price: '1' })],
      ['close', () => casey.post(`${PRODUCTS}/${productId}/close`)],
      ['load', () => casey.upload('/api/sales/store/load', 'x.xlsx', Buffer.from('x'))],
    ];
    for (const [name, call] of calls) expect((await call()).status, name).toBe(403);
    expect(await priceNow()).toBe(100_000);
  });

  test('[story-01-04#3] another spelling of a store page address is sent to the guarded page and refused, never served (review finding)', async () => {
    // Already the guarded spelling: refused directly.
    expect((await casey.get('/sales/store/')).status).toBe(403);
    for (const spelling of ['/SALES/store', '/Sales/Store/products/1', '//sales/store', '/sales%2Fstore', '/SALES']) {
      const first = await casey.get(spelling);
      expect(first.status, spelling).toBe(308);
      expect(first.body, spelling).not.toContain(INDEX_HTML);
      const location = String(first.headers.location);
      expect(location, spelling).toMatch(/^\/sales(\/|$)/);
      const followed = await casey.get(location);
      expect(followed.status, `${spelling} → ${location}`).toBe(403);
      expect(followed.body).not.toContain(INDEX_HTML);
    }
  });

  test('[story-01-04#3] spellings with control characters or hidden dot segments are refused, never served and never a server error (review rounds 2 and 3)', async () => {
    for (const spelling of ['/SALES/%0d%0aSet-Cookie:%20x=1', '/SALES/%00', '/SALES/x%0aY', '/SALES/%E2%80%A8']) {
      const response = await casey.get(spelling);
      expect([308, 404], spelling).toContain(response.status);
      expect(response.headers['set-cookie'], spelling).toBeUndefined();
      if (response.status === 308) {
        const location = String(response.headers.location);
        expect(location, spelling).toMatch(/^\/sales(\/[\x21-\x7e]*)?$/);
        expect((await casey.get(location)).status, location).toBe(403);
      }
    }
    // A dot segment hidden behind an encoding is never resolved, redirected or served (N-3).
    for (const hidden of [
      '/SALES/store/..%2F..%2Fsales%2Fstore',
      '/sales%2f..%2fdev%2fmailbox',
      '/SALES/store/products/1%2f..%2f..%2f..%2f..%2fhome',
      '/Sales/Store/Products/1%2F..%2F..%2F..%2F..',
      '/SALES/named-users%2f..%2f..%2fx',
      '/SALES/%5C..%5C..%5C%5Cevil.com',
      '/sales%252f..%252fdev',
    ]) {
      const response = await casey.get(hidden);
      expect(response.status, hidden).toBe(404);
      expect(response.body, hidden).not.toContain(INDEX_HTML);
    }
    // Double-encoded and padded spellings reach the guarded page and are refused.
    for (const spelling of ['/SALES%252Fstore', '/sales%252Fstore']) {
      const first = await casey.get(spelling);
      expect(first.status, spelling).toBe(308);
      expect((await casey.get(String(first.headers.location))).status, spelling).toBe(403);
    }
  });

  test('[story-01-04#4] a store page opened under another spelling is recorded as a refused page', async () => {
    const first = await casey.get('/SALES/Store/Load-Summary');
    await casey.get(String(first.headers.location));
    const jo = await portal.signIn(JO);
    const list = (await jo.get('/api/sales/refused-attempts')).json;
    expect(list[0]).toMatchObject({ user: 'Casey (Reseller A, buyer)', action: 'open page /sales/store/load-summary' });
  });

  test('[story-01-04#4] a store change sent without the anti-forgery token is refused and recorded too', async () => {
    expect((await casey.post(`${PRODUCTS}/${productId}/price`, { price: '1.00' }, { csrf: false })).status).toBe(403);
    expect((await sam.post(`${PRODUCTS}/${productId}/close`, {}, { csrf: false })).status).toBe(403);
    const jo = await portal.signIn(JO);
    const actions = (await jo.get('/api/sales/refused-attempts')).json.slice(0, 2).map((r: any) => `${r.user}: ${r.action}`);
    expect(actions).toEqual([
      `Sam (rep): close a product for quoting (POST ${PRODUCTS}/${productId}/close) without the anti-forgery token`,
      `Casey (Reseller A, buyer): change a price (POST ${PRODUCTS}/${productId}/price) without the anti-forgery token`,
    ]);
    expect(await priceNow()).toBe(100_000);
  });

  test('[story-01-04#4] after a reseller user is refused a store page, the refused attempts record holds the user, the page, and the date and time', async () => {
    const before = new Date().toISOString();
    expect((await casey.get('/sales/store/load-summary')).status).toBe(403);
    const after = new Date().toISOString();
    const jo = await portal.signIn(JO);
    const list = await jo.get('/api/sales/refused-attempts');
    expect(list.status).toBe(200);
    const entry = list.json.find((r: any) => r.action === 'open page /sales/store/load-summary' && r.at >= before);
    expect(entry).toMatchObject({ userKind: 'reseller', user: 'Casey (Reseller A, buyer)', action: 'open page /sales/store/load-summary' });
    expect(entry.at >= before && entry.at <= after).toBe(true);
    // The record cannot be edited or removed.
    expect(() => portal.raw.prepare('DELETE FROM refused_attempt').run()).toThrow(/append-only/);
    expect(() => portal.raw.prepare("UPDATE refused_attempt SET action = 'nothing'").run()).toThrow(/append-only/);
  });

  test('[story-01-04#4] the refused attempts list is for internal admins: a rep and a reseller user are refused it', async () => {
    expect((await sam.get('/api/sales/refused-attempts')).status).toBe(403);
    expect((await casey.get('/api/sales/refused-attempts')).status).toBe(403);
    expect((await sam.get('/sales/refused-attempts')).status).toBe(200); // the page shell; its data is refused above
  });

  test('[story-01-04#5] a rep not named who sends a price change directly, without the product page, is refused and the price is unchanged', async () => {
    // With a valid session and anti-forgery token: refused by role.
    const direct = await sam.post(`${PRODUCTS}/${productId}/price`, { price: '0.01' });
    expect(direct.status).toBe(403);
    // Without the anti-forgery token: refused, even for the price maintainer (T-21).
    expect((await sam.post(`${PRODUCTS}/${productId}/price`, { price: '0.01' }, { csrf: false })).status).toBe(403);
    expect((await pat.post(`${PRODUCTS}/${productId}/price`, { price: '0.01' }, { csrf: false })).status).toBe(403);
    // Without any session: refused.
    expect((await portal.anonymous().post(`${PRODUCTS}/${productId}/price`, { price: '0.01' })).status).toBe(401);
    expect(await priceNow()).toBe(100_000);
    const jo = await portal.signIn(JO);
    const recorded = (await jo.get('/api/sales/refused-attempts')).json;
    expect(recorded.some((r: any) => r.user === 'Sam (rep)' && r.action === `change a price (POST ${PRODUCTS}/${productId}/price)`)).toBe(true);
  });
});

describe('who is admitted to the internal side', () => {
  let portal: Portal;
  beforeAll(async () => {
    portal = await startPortal();
  });
  afterAll(async () => {
    await portal?.close();
  });

  test('a Bow account that is not on the internal users list is refused sign-in, and the refusal recorded (T-05)', async () => {
    await expect(portal.signIn('local-staff-chris')).rejects.toThrow(/401/);
    const jo = await portal.signIn(JO);
    const list = (await jo.get('/api/sales/refused-attempts')).json;
    expect(list[0]).toMatchObject({ userKind: 'staff not listed', user: 'Chris (Bow, not on the list) <chris@bow.example>', action: 'sign in to the internal side' });
  });

  test('a signed-out visitor to a store page is sent to sign in, and the page is not served', async () => {
    const response = await portal.anonymous().get('/sales/store');
    expect(response.status).toBe(302);
    expect(response.headers.location).toBe('/sign-in?next=%2Fsales%2Fstore');
  });
});

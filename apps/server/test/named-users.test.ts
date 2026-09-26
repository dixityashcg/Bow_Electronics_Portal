import { afterAll, beforeEach, describe, expect, test } from 'vitest';
import { ALEX, JO, LEE, MORGAN, PAT, SAM, startPortal, type Client, type Portal } from './harness.ts';

/** story-01-05 — Name who may maintain prices and who may set discounts. */

const NAMED = '/api/sales/named-users';
const removeUrl = (userId: number, role: string) => `${NAMED}/${userId}/${encodeURIComponent(role)}`;

describe('naming price maintainers and discount setters', () => {
  let portal: Portal;
  let morgan: Client;
  let productId: number;

  beforeEach(async () => {
    await portal?.close();
    portal = await startPortal();
    morgan = await portal.signIn(MORGAN);
    const pat = await portal.signIn(PAT);
    productId = (await pat.post('/api/sales/store/products', { partNumber: 'BWE-NAMED-1', description: 'Inductor, 10 µH, 1.2 A, shielded', price: '10.00' })).json.id;
  });
  afterAll(async () => {
    await portal?.close();
  });

  const price = async () => (await (await portal.signIn(PAT)).get(`/api/sales/store/products/${productId}`)).json.price as number;
  const resellerId = async (name: string) =>
    (await portal.db.selectFrom('reseller').select('reseller_id').where('name', '=', name).executeTakeFirstOrThrow()).reseller_id;
  const discountOf = async (name: string) =>
    (await (await portal.signIn(SAM)).get('/api/sales/resellers')).json.find((r: any) => r.name === name).standardDiscountText as string;
  const rolesOf = async (subjectId: string) => {
    const id = await portal.internalUserId(subjectId);
    return (await morgan.get(NAMED)).json.users.find((u: any) => u.id === id).roles as string[];
  };

  test('[story-01-05#1] once the role manager names rep Sam to maintain prices, Sam can change a price', async () => {
    const sam = await portal.signIn(SAM); // signed in before being named: the role is read on every call
    expect((await sam.post(`/api/sales/store/products/${productId}/price`, { price: '11.00' })).status).toBe(403);
    const named = await morgan.post(NAMED, { internalUserId: await portal.internalUserId(SAM), role: 'price maintainer' });
    expect(named.status, named.body).toBe(204);
    expect(await rolesOf(SAM)).toEqual(['price maintainer']);
    const changed = await sam.post(`/api/sales/store/products/${productId}/price`, { price: '11.00' });
    expect(changed.status, changed.body).toBe(201);
    expect(await price()).toBe(110_000);
  });

  test('[story-01-05#2] once Pat is no longer named, Pat’s next price change is refused and the price is unchanged, even from a page already open', async () => {
    const pat = await portal.signIn(PAT);
    expect((await pat.post(`/api/sales/store/products/${productId}/price`, { price: '10.50' })).status).toBe(201);
    const removed = await morgan.delete(removeUrl(await portal.internalUserId(PAT), 'price maintainer'));
    expect(removed.status, removed.body).toBe(204);
    const refused = await pat.post(`/api/sales/store/products/${productId}/price`, { price: '12.00' });
    expect(refused.status).toBe(403);
    expect(await price()).toBe(105_000);
    // The earlier naming and its removal are both kept.
    const kept = portal.raw.prepare("SELECT revoked_at FROM role_assignment_history WHERE role = 'price maintainer'").all();
    expect(kept.length).toBeGreaterThan(0);
  });

  test('[story-01-05#3] once the role manager names rep Alex to set discounts, Alex can set a reseller’s standard discount', async () => {
    const alex = await portal.signIn(ALEX);
    const a = await resellerId('Demo Reseller A');
    expect((await alex.post(`/api/sales/resellers/${a}/standard-discount`, { percent: '12' })).status).toBe(403);
    expect((await morgan.post(NAMED, { internalUserId: await portal.internalUserId(ALEX), role: 'discount setter' })).status).toBe(204);
    const set = await alex.post(`/api/sales/resellers/${a}/standard-discount`, { percent: '12' });
    expect(set.status, set.body).toBe(201);
    expect(set.json.standardDiscountText).toBe('12 %');
    expect(await discountOf('Demo Reseller A')).toBe('12 %');
    const history = (await alex.get(`/api/sales/resellers/${a}/discount-history`)).json;
    expect(history).toEqual([expect.objectContaining({ oldPercent: 'None', newPercent: '12 %', changedBy: 'Alex (rep)' })]);
  });

  test('[story-01-05#4] once Lee is no longer named to set discounts, Lee’s change to a standard discount is refused and the discount is unchanged', async () => {
    const lee = await portal.signIn(LEE);
    const c = await resellerId('Demo Reseller C');
    expect(await discountOf('Demo Reseller C')).toBe('10 %');
    expect((await lee.post(`/api/sales/resellers/${c}/standard-discount`, { percent: '11' })).status).toBe(201);
    expect((await morgan.delete(removeUrl(await portal.internalUserId(LEE), 'discount setter'))).status).toBe(204);
    expect((await lee.post(`/api/sales/resellers/${c}/standard-discount`, { percent: '15' })).status).toBe(403);
    expect(await discountOf('Demo Reseller C')).toBe('11 %');
  });

  test('[story-01-05#4] the two lists are separate: a price maintainer cannot set a discount, and a discount setter cannot change a price', async () => {
    const pat = await portal.signIn(PAT);
    const lee = await portal.signIn(LEE);
    const d = await resellerId('Demo Reseller D');
    expect((await pat.post(`/api/sales/resellers/${d}/standard-discount`, { percent: '20' })).status).toBe(403);
    expect(await discountOf('Demo Reseller D')).toBe('12.5 %');
    expect((await lee.post(`/api/sales/store/products/${productId}/price`, { price: '20.00' })).status).toBe(403);
    expect(await price()).toBe(100_000);
  });

  test('[story-01-05#5] a rep named for neither list is refused changing who is named, and so is a price maintainer', async () => {
    const sam = await portal.signIn(SAM);
    const pat = await portal.signIn(PAT);
    const samId = await portal.internalUserId(SAM);
    const patId = await portal.internalUserId(PAT);
    expect((await sam.post(NAMED, { internalUserId: samId, role: 'price maintainer' })).status).toBe(403);
    expect((await sam.post(NAMED, { internalUserId: await portal.internalUserId(ALEX), role: 'discount setter' })).status).toBe(403);
    expect((await sam.delete(removeUrl(patId, 'price maintainer'))).status).toBe(403);
    expect((await pat.post(NAMED, { internalUserId: samId, role: 'price maintainer' })).status).toBe(403);
    expect(await rolesOf(SAM)).toEqual([]);
    expect(await rolesOf(PAT)).toEqual(['price maintainer']);
  });

  test('[story-01-05#5] nobody names themself: an internal admin and a role manager are both refused (T-08)', async () => {
    const jo = await portal.signIn(JO);
    expect((await jo.post(NAMED, { internalUserId: await portal.internalUserId(JO), role: 'price maintainer' })).status).toBe(403);
    expect((await morgan.post(NAMED, { internalUserId: await portal.internalUserId(MORGAN), role: 'discount setter' })).status).toBe(403);
    expect(await rolesOf(JO)).toEqual(['internal admin']);
    expect(await rolesOf(MORGAN)).toEqual(['role manager']);
  });

  test('naming someone already named, or removing someone not named, is refused and changes nothing', async () => {
    expect((await morgan.post(NAMED, { internalUserId: await portal.internalUserId(PAT), role: 'price maintainer' })).status).toBe(409);
    expect((await morgan.delete(removeUrl(await portal.internalUserId(SAM), 'discount setter'))).status).toBe(409);
    expect((await morgan.delete(removeUrl(await portal.internalUserId(SAM), 'role manager'))).status).toBe(400);
    expect((await morgan.post(NAMED, { internalUserId: await portal.internalUserId(SAM), role: 'role manager' })).status).toBe(400);
  });
});

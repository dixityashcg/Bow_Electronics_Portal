/**
 * epic-01 QA cases, as designed in ../artifacts/test-cases.md. Each case writes
 * its evidence to ../evidence/<case>/ and its outcome to ./results.json.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { writeFileSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Client, Evidence, Portal, ROOT, pct, priceUnits, readErp, useEvidence, workbook, type CellValue } from './lib.ts';

const SAMPLE = join(ROOT, 'seed/sample-erp.xlsx');
const RESULTS = join(import.meta.dirname, 'results.json');
const results: Record<string, { pass: boolean; failed: string[]; checks: number; at: string }> = (() => {
  try { return JSON.parse(readFileSync(RESULTS, 'utf8')); } catch { return {}; }
})();
afterAll(() => writeFileSync(RESULTS, JSON.stringify(results, null, 2)));

async function runCase(id: string, title: string, fn: (ev: Evidence) => Promise<void>, extra?: () => Record<string, unknown>) {
  const ev = new Evidence(id, title);
  useEvidence(ev);
  try {
    await fn(ev);
  } catch (error: any) {
    ev.check('case ran to completion', false, String(error?.stack ?? error));
  }
  useEvidence(null);
  const pass = ev.save(extra?.() ?? {});
  results[id] = { pass, checks: ev.checks.length, failed: ev.checks.filter((c) => !c.pass).map((c) => `${c.name}: ${c.detail}`), at: new Date().toISOString() };
  expect(pass, results[id].failed.join('\n')).toBe(true);
}

const staff = (s: string) => `local-staff-${s}`;
async function ids(p: Portal) {
  const rows = p.query<{ internal_user_id: number; entra_object_id: string }>('select internal_user_id, entra_object_id from internal_user');
  const m: Record<string, number> = {};
  for (const r of rows) m[r.entra_object_id.replace('local-staff-', '')] = r.internal_user_id;
  return m;
}
async function addProduct(c: Client, partNumber: string, price = '10.00', description = `QA product ${partNumber}`) {
  const a = await c.req('POST', '/api/sales/store/products', { json: { partNumber, description, price } });
  return a;
}
const enc = encodeURIComponent;

// =====================================================================
// A — the loaded store: sample ERP loaded through the real load, as Pat
// =====================================================================
describe.sequential('A: loaded store', () => {
  const p = new Portal('A-loaded');
  let pat: Client, sam: Client, casey: Client, jo: Client, lee: Client, morgan: Client, riley: Client;
  let erp: Awaited<ReturnType<typeof readErp>>;
  let summary: any;
  const products: Record<string, any> = {};
  beforeAll(async () => {
    await p.start();
    erp = await readErp(SAMPLE);
    pat = await Client.as(p, 'Pat (rep, price maintainer)', staff('pat'));
    sam = await Client.as(p, 'Sam (rep, named for nothing)', staff('sam'));
    jo = await Client.as(p, 'Jo (internal admin)', staff('jo'));
    lee = await Client.as(p, 'Lee (rep, discount setter)', staff('lee'));
    morgan = await Client.as(p, 'Morgan (role manager)', staff('morgan'));
    casey = await Client.as(p, 'Casey (Reseller A, buyer)', 'local-reseller-a-casey', 'reseller');
    riley = await Client.as(p, 'Riley (Reseller A, admin)', 'local-reseller-a-admin', 'reseller');
  }, 60_000);
  afterAll(() => p.stop());

  const product = async (pn: string) => (await pat.req('GET', `/api/sales/store/part-numbers/${enc(pn)}`, { log: false })).json;

  it('TC-01', () => runCase('TC-01', 'story-01-01 #1 — loaded + not loaded = N', async (ev) => {
    const N = erp.rows.length;
    ev.note(`N counted independently from seed/sample-erp.xlsx (every non-empty row below the heading row of the first worksheet): ${N}`);
    const a = await pat.load(readFileSync(SAMPLE), 'sample-erp.xlsx');
    ev.check('load accepted', a.status >= 200 && a.status < 300, `HTTP ${a.status}`);
    summary = a.json.summary;
    ev.check('summary: product rows in the ERP = N', summary.rowsInErp === N, `rowsInErp ${summary.rowsInErp}, N ${N}`);
    ev.check('loaded + not loaded = N', summary.rowsLoaded + summary.rowsNotLoaded === N, `${summary.rowsLoaded} + ${summary.rowsNotLoaded} = ${summary.rowsLoaded + summary.rowsNotLoaded}; N ${N}`);
    ev.check('rows listed = rows counted as not loaded', summary.notLoaded.length === summary.rowsNotLoaded, `${summary.notLoaded.length} listed`);
    const inStore = p.query<{ n: number }>('select count(*) n from product')[0]!.n;
    ev.check('store holds exactly the number reported loaded', inStore === summary.rowsLoaded, `product table ${inStore}, reported ${summary.rowsLoaded}`);
  }, () => ({ 'summary.json': summary })));

  it('TC-02', () => runCase('TC-02', 'story-01-01 #2 — every loaded ERP row matches its store product', async (ev) => {
    const listed = new Set(summary.notLoaded.map((r: any) => r.rowNumber));
    const db = p.query<{ part_number: string; description: string; price: number; open_for_quoting: number }>('select part_number, description, price, open_for_quoting from product');
    const byPn = new Map(db.map((r) => [r.part_number, r]));
    let compared = 0; const mismatches: string[] = []; const missing: number[] = [];
    for (const row of erp.rows) {
      if (listed.has(row.rowNumber)) continue;
      const s = byPn.get(row.partNumber);
      if (!s) { missing.push(row.rowNumber); continue; }
      compared++;
      const units = priceUnits(row.price);
      if (s.description !== row.description) mismatches.push(`row ${row.rowNumber} description ${JSON.stringify(s.description)} ≠ ERP ${JSON.stringify(row.description)}`);
      if (s.price !== units) mismatches.push(`row ${row.rowNumber} price ${s.price} ≠ ERP ${row.priceText} (${units})`);
      if (s.open_for_quoting !== 1) mismatches.push(`row ${row.rowNumber} not open`);
    }
    ev.check('every ERP row is either in the store (exact part number bytes) or listed not loaded', missing.length === 0, missing.length ? `rows neither loaded nor listed: ${missing.slice(0, 20).join(', ')}` : `${compared} loaded rows found, ${listed.size} listed`);
    ev.check('part number, description, price and Open match the ERP row, database bytes, every loaded row', mismatches.length === 0, mismatches.length ? mismatches.slice(0, 20).join('; ') : `${compared} rows compared`);
    // Through the interface: first, last and 40 more spread across the file.
    const loadable = erp.rows.filter((r) => !listed.has(r.rowNumber));
    const picks = [loadable[0]!, loadable.at(-1)!, ...Array.from({ length: 40 }, (_, i) => loadable[Math.floor(((i + 1) * 7919) % loadable.length)]!)];
    const apiBad: string[] = [];
    for (const row of picks) {
      const a = await pat.req('GET', `/api/sales/store/part-numbers/${enc(row.partNumber)}`);
      const j = a.json;
      if (a.status !== 200 || j.partNumber !== row.partNumber || j.description !== row.description || j.price !== priceUnits(row.price) || j.status !== 'Open for quoting') apiBad.push(`row ${row.rowNumber}: HTTP ${a.status} ${a.text.slice(0, 160)}`);
    }
    ev.check('lookup by full part number through the interface matches (42 rows incl. first and last)', apiBad.length === 0, apiBad.join('; ') || `${picks.length} lookups matched`);
  }));

  it('TC-03', () => runCase('TC-03', 'story-01-01 #3 — no part number / no price listed with reason', async (ev) => {
    const noPn = erp.rows.filter((r) => r.partNumber.trim() === '');
    const noPrice = erp.rows.filter((r) => r.price === null || r.price === undefined || String(r.priceText).trim() === '');
    ev.check('sample has at least one row with no part number and one with no price', noPn.length > 0 && noPrice.length > 0, `no part number: rows ${noPn.map((r) => r.rowNumber)}; no price: rows ${noPrice.map((r) => r.rowNumber)}`);
    for (const r of [...noPn, ...noPrice]) {
      const l = summary.notLoaded.find((x: any) => x.rowNumber === r.rowNumber);
      ev.check(`row ${r.rowNumber} listed with a reason`, !!l && typeof l.reason === 'string' && l.reason.length > 0, l ?? 'not listed');
    }
    for (const r of noPrice) {
      const a = await pat.req('GET', `/api/sales/store/part-numbers/${enc(r.partNumber)}`);
      ev.check(`row ${r.rowNumber} (${r.partNumber}) not in the store`, a.status === 404, `HTTP ${a.status}`);
    }
  }));

  it('TC-04', () => runCase('TC-04', 'story-01-01 #4 — duplicate part number at different prices', async (ev) => {
    const groups = new Map<string, typeof erp.rows>();
    for (const r of erp.rows) if (r.partNumber.trim()) groups.set(r.partNumber, [...(groups.get(r.partNumber) ?? []), r]);
    const dups = [...groups.entries()].filter(([, rows]) => rows.length > 1);
    ev.check('sample has a duplicate group at different prices', dups.some(([, rows]) => new Set(rows.map((r) => r.priceText)).size > 1), dups.map(([pn, rows]) => `${pn}: rows ${rows.map((r) => `${r.rowNumber}@${r.priceText}`)}`).join('; '));
    for (const [pn, rows] of dups) {
      for (const r of rows) {
        const l = summary.notLoaded.find((x: any) => x.rowNumber === r.rowNumber);
        ev.check(`row ${r.rowNumber} listed "duplicate part number"`, l?.reason === 'duplicate part number', l ?? 'not listed');
      }
      const a = await pat.req('GET', `/api/sales/store/part-numbers/${enc(pn)}`);
      ev.check(`${pn} not in the store`, a.status === 404, `HTTP ${a.status}`);
    }
  }));

  it('TC-05', () => runCase('TC-05', 'story-01-01 #5 — summary not reported complete', async (ev) => {
    const a = await sam.req('GET', '/api/sales/store/load-summary');
    const s = a.json?.summary;
    ev.check('summary answered when viewed later', a.status === 200 && !!s, `HTTP ${a.status}`);
    ev.check('rows not loaded > 0', s.rowsNotLoaded > 0, s.rowsNotLoaded);
    ev.check('not reported complete (flag)', s.complete === false, s.complete);
    ev.check('not reported complete (words)', /not complete/i.test(s.statusText) && !/^load complete/i.test(s.statusText), s.statusText);
  }));

  it('TC-09', () => runCase('TC-09', 'story-01-03 #1 — closed product shows Closed', async (ev) => {
    const target = await product(erp.rows[1]!.partNumber);
    ev.check('product starts Open for quoting', target.status === 'Open for quoting', target.status);
    const a = await pat.req('POST', `/api/sales/store/products/${target.id}/close`);
    ev.check('close accepted', a.status >= 200 && a.status < 300, `HTTP ${a.status} ${a.text.slice(0, 200)}`);
    const b = await pat.req('GET', `/api/sales/store/products/${target.id}`);
    ev.check('product shows status Closed', b.json.status === 'Closed', b.json.status);
    const page = await pat.req('GET', `/sales/store/products/${target.id}`);
    ev.check('product page is served to the maintainer', page.status === 200, `HTTP ${page.status}`);
    ev.note('The status is read from the interface the product page renders; the rendered badge itself was not seen (no browser in this session).');
  }));

  it('TC-10', () => runCase('TC-10', 'story-01-04 #1 — rep not named refused a price change', async (ev) => {
    const t = await product(erp.rows[2]!.partNumber);
    const h0 = (await sam.req('GET', `/api/sales/store/products/${t.id}/price-history`)).json;
    const a = await sam.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '99.99' } });
    ev.check('change refused', a.status === 403, `HTTP ${a.status} ${a.text}`);
    const t2 = await product(t.partNumber);
    ev.check('price unchanged', t2.price === t.price, `${t.priceText} → ${t2.priceText}`);
    const h1 = (await sam.req('GET', `/api/sales/store/products/${t.id}/price-history`)).json;
    ev.check('price history unchanged', h1.length === h0.length, `${h0.length} → ${h1.length}`);
    products.samRefused = t;
  }));

  it('TC-11', () => runCase('TC-11', 'story-01-04 #2 — rep not named refused add and close', async (ev) => {
    const n0 = p.query<{ n: number }>('select count(*) n from product')[0]!.n;
    const a = await addProduct(sam, 'QA-SAM-ADD-1');
    ev.check('add refused', a.status === 403, `HTTP ${a.status} ${a.text}`);
    const l = await sam.req('GET', '/api/sales/store/part-numbers/QA-SAM-ADD-1');
    ev.check('part number not in the store', l.status === 404, `HTTP ${l.status}`);
    const t = await product(erp.rows[3]!.partNumber);
    const c = await sam.req('POST', `/api/sales/store/products/${t.id}/close`);
    ev.check('close refused', c.status === 403, `HTTP ${c.status} ${c.text}`);
    ev.check('product still Open for quoting', (await product(t.partNumber)).status === 'Open for quoting');
    const n1 = p.query<{ n: number }>('select count(*) n from product')[0]!.n;
    const closed = p.query<{ n: number }>('select count(*) n from product where open_for_quoting = 0')[0]!.n;
    ev.check('product count unchanged', n0 === n1, `${n0} → ${n1}`);
    ev.check('no product closed beyond TC-09’s one', closed === 1, `${closed} closed`);
  }));

  const pages = (id: number) => ['/sales', '/sales/store', '/sales/store/load-summary', `/sales/store/products/${id}`, '/sales/store/products/new', '/sales/named-users', '/sales/resellers', '/sales/refused-attempts'];
  let caseyPagesAt = '';
  it('TC-12', () => runCase('TC-12', 'story-01-04 #3 — reseller refused every store page', async (ev) => {
    const t = await product(erp.rows[4]!.partNumber);
    caseyPagesAt = new Date().toISOString();
    for (const path of pages(t.id)) {
      const c = await casey.req('GET', path);
      ev.check(`Casey refused ${path}`, c.status === 403 && /Access refused/.test(c.text) && !/id="root"/.test(c.text), `HTTP ${c.status}`);
      const pp = await pat.req('GET', path);
      ev.check(`Pat answered ${path} (the route answers)`, pp.status === 200, `HTTP ${pp.status}`);
    }
    const r = await riley.req('GET', '/sales/store');
    ev.check('Riley (Reseller A admin) refused /sales/store', r.status === 403, `HTTP ${r.status}`);
  }));

  it('TC-13', () => runCase('TC-13', 'story-01-04 #4 — refused attempt record holds user, page, date and time', async (ev) => {
    const a = await jo.req('GET', '/api/sales/refused-attempts');
    ev.check('Jo reads the list', a.status === 200, `HTTP ${a.status}`);
    const t = await product(erp.rows[4]!.partNumber);
    for (const path of pages(t.id)) {
      const rec = a.json.find((r: any) => r.user === 'Casey (Reseller A, buyer)' && r.action.includes(path) && r.at >= caseyPagesAt);
      ev.check(`record for Casey ${path}: user, page, date and time`, !!rec && !!rec.user && !!rec.action && !Number.isNaN(Date.parse(rec.at)), rec ?? 'no record');
    }
  }));

  it('TC-14', () => runCase('TC-14', 'story-01-04 #5 — direct price change by a rep not named', async (ev) => {
    const t = await product(erp.rows[5]!.partNumber);
    ev.check('Sam holds a valid session and anti-forgery token', !!sam.cookie && !!sam.csrf);
    const a = await sam.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '0.01' }, headers: { accept: 'application/json' } });
    ev.check('refused', a.status === 403, `HTTP ${a.status} ${a.text}`);
    ev.check('price unchanged', (await product(t.partNumber)).price === t.price);
    const rec = (await jo.req('GET', '/api/sales/refused-attempts')).json.find((r: any) => r.user === 'Sam (rep)' && r.action.includes(`/api/sales/store/products/${t.id}/price`));
    ev.check('refusal recorded with the route', !!rec, rec ?? 'none');
  }));

  it('TC-24', () => runCase('TC-24', 'T-15 — the load run a second time over a maintained store', async (ev) => {
    const t = await product(erp.rows[6]!.partNumber);
    const c = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '77.77' } });
    ev.check('maintained price change accepted', c.status >= 200 && c.status < 300, `HTTP ${c.status}`);
    const n0 = p.query<{ n: number }>('select count(*) n from product')[0]!.n;
    const runs0 = p.query<{ n: number }>('select count(*) n from erp_load_run')[0]!.n;
    const a = await pat.load(readFileSync(SAMPLE), 'sample-erp.xlsx');
    ev.check('second load refused (4xx)', a.status >= 400 && a.status < 500, `HTTP ${a.status} ${a.text.slice(0, 300)}`);
    ev.check('product count unchanged', p.query<{ n: number }>('select count(*) n from product')[0]!.n === n0);
    ev.check('maintained price not overwritten', (await product(t.partNumber)).priceText === '77.77');
    ev.note(`erp_load_run rows before ${runs0}, after ${p.query<{ n: number }>('select count(*) n from erp_load_run')[0]!.n}`);
  }));

  it('TC-34', () => runCase('TC-34', 'cross-story: add → change price → close → change price → look up', async (ev) => {
    const a = await addProduct(pat, 'QA-SEQ-0001', '5.00');
    ev.check('add accepted', a.status >= 200 && a.status < 300, `HTTP ${a.status} ${a.text.slice(0, 200)}`);
    const t = await product('QA-SEQ-0001');
    const c1 = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '6.00' } });
    ev.check('price change accepted', c1.status >= 200 && c1.status < 300, `HTTP ${c1.status}`);
    const cl = await pat.req('POST', `/api/sales/store/products/${t.id}/close`);
    ev.check('close accepted', cl.status >= 200 && cl.status < 300, `HTTP ${cl.status}`);
    const c2 = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '7.00' } });
    ev.note(`Price change on a closed product: HTTP ${c2.status} ${c2.text.slice(0, 200)} (no criterion states either way)`);
    ev.check('price change on a closed product answers without a server error', c2.status < 500, `HTTP ${c2.status}`);
    const t2 = await product('QA-SEQ-0001');
    ev.check('still Closed after the price action', t2.status === 'Closed', t2.status);
    const h = (await pat.req('GET', `/api/sales/store/products/${t.id}/price-history`)).json;
    ev.check('history agrees with the price', h.length > 0 && h.at(-1).newPrice === t2.priceText, `history ${JSON.stringify(h)}; price ${t2.priceText}`);
    ev.check('history chains old → new', h.every((l: any, i: number) => i === 0 ? l.oldPrice === '5.00' : l.oldPrice === h[i - 1].newPrice), JSON.stringify(h));
    const s = await pat.req('GET', `/api/sales/store/products?q=QA-SEQ-0001`);
    ev.note(`Internal store search for the closed product returns ${Array.isArray(s.json) ? s.json.length : '?'} result(s): ${s.text.slice(0, 200)}`);
  }));

  it('TC-38', () => runCase('TC-38', 'the two named lists are separate', async (ev) => {
    const before = p.query('select reseller_id, percent_hundredths from standard_discount order by reseller_id');
    const d = await pat.req('POST', '/api/sales/resellers/1/standard-discount', { json: { percent: '5' } });
    ev.check('price maintainer refused a discount', d.status === 403, `HTTP ${d.status}`);
    const t = await product(erp.rows[7]!.partNumber);
    const n0 = p.query<{ n: number }>('select count(*) n from product')[0]!.n;
    const c = await lee.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '1.23' } });
    ev.check('discount setter refused a price change', c.status === 403, `HTTP ${c.status}`);
    const add = await addProduct(lee, 'QA-LEE-ADD');
    ev.check('discount setter refused add', add.status === 403, `HTTP ${add.status}`);
    const cl = await lee.req('POST', `/api/sales/store/products/${t.id}/close`);
    ev.check('discount setter refused close', cl.status === 403, `HTTP ${cl.status}`);
    const ld = await lee.load(await workbook([['QA-LEE-1', 'x', 1]]));
    ev.check('discount setter refused the load', ld.status === 403, `HTTP ${ld.status}`);
    const t2 = await product(t.partNumber);
    ev.check('nothing changed', t2.price === t.price && t2.status === t.status && p.query<{ n: number }>('select count(*) n from product')[0]!.n === n0 && JSON.stringify(p.query('select reseller_id, percent_hundredths from standard_discount order by reseller_id')) === JSON.stringify(before));
  }));

  const routes = (id: number, pn: string, alex: number) => [
    { m: 'GET', path: `/api/sales/store/products?q=capacitor`, ok: () => sam },
    { m: 'GET', path: `/api/sales/store/part-numbers/${enc(pn)}`, ok: () => sam },
    { m: 'GET', path: `/api/sales/store/products/${id}`, ok: () => sam },
    { m: 'GET', path: `/api/sales/store/products/${id}/price-history`, ok: () => sam },
    { m: 'POST', path: `/api/sales/store/products`, json: { partNumber: 'QA-ROUTE-ADD', description: 'route probe', price: '1.00' }, ok: () => pat },
    { m: 'POST', path: `/api/sales/store/products/${id}/price`, json: { price: '3.33' }, ok: () => pat },
    { m: 'POST', path: `/api/sales/store/products/${id}/close`, ok: () => pat },
    { m: 'GET', path: `/api/sales/store/load-summary`, ok: () => sam },
    { m: 'POST', path: `/api/sales/store/load`, file: true, ok: () => pat, answersWith: 'a 4xx other than 401/403 (the store already holds products)' },
    { m: 'GET', path: `/api/sales/resellers`, ok: () => sam },
    { m: 'GET', path: `/api/sales/resellers/1/discount-history`, ok: () => sam },
    { m: 'POST', path: `/api/sales/resellers/1/standard-discount`, json: { percent: '7' }, ok: () => lee },
    { m: 'GET', path: `/api/sales/named-users`, ok: () => sam },
    { m: 'POST', path: `/api/sales/named-users`, json: { internalUserId: alex, role: 'discount setter' }, ok: () => morgan },
    { m: 'DELETE', path: `/api/sales/named-users/${alex}/${enc('discount setter')}`, ok: () => morgan },
    { m: 'GET', path: `/api/sales/refused-attempts`, ok: () => jo },
  ] as const;

  it('TC-39', () => runCase('TC-39', 'T-06 — a reseller calls every internal route directly', async (ev) => {
    const t = await product(erp.rows[8]!.partNumber);
    const u = await ids(p);
    const snapshot = () => JSON.stringify([p.query('select * from product where product_id = ?', t.id), p.query('select count(*) n from product'), p.query('select * from standard_discount'), p.query('select * from role_assignment where revoked_at is null')]);
    const before = snapshot();
    const recs0 = p.query<{ n: number }>("select count(*) n from refused_attempt where user_label like 'Casey%'")[0]!.n;
    const rs = routes(t.id, t.partNumber, u.alex!);
    const form = async () => { const f = new FormData(); f.append('file', new Blob([await workbook([['QA-CASEY-1', 'x', 1]])]), 'erp.xlsx'); return f; };
    for (const r of rs) {
      const a = await casey.req(r.m, r.path, { json: (r as any).json, form: (r as any).file ? await form() : undefined });
      ev.check(`Casey refused ${r.m} ${r.path}`, a.status === 403, `HTTP ${a.status}`);
      ev.check(`Casey's answer carries no store data (${r.m} ${r.path})`, !/partNumber|standardDiscount|oldPrice|userKind/.test(a.text), a.text.slice(0, 120));
    }
    ev.check('nothing changed after Casey’s calls', snapshot() === before);
    const recs1 = p.query<{ n: number }>("select count(*) n from refused_attempt where user_label like 'Casey%'")[0]!.n;
    ev.check('every refusal recorded', recs1 - recs0 === rs.length, `${recs1 - recs0} new records for ${rs.length} refusals`);
    for (const r of rs) {
      const a = await r.ok().req(r.m, r.path, { json: (r as any).json, form: (r as any).file ? await form() : undefined });
      const good = (r as any).answersWith ? a.status >= 400 && a.status < 500 && a.status !== 401 && a.status !== 403 : a.status >= 200 && a.status < 300;
      ev.check(`entitled caller answered ${r.m} ${r.path}`, good, `${r.ok().who}: HTTP ${a.status} ${a.text.slice(0, 120)}`);
    }
  }));

  it('TC-40', () => runCase('TC-40', 'no session: every internal route', async (ev) => {
    const anon = new Client(p, 'no session');
    const t = await product(erp.rows[9]!.partNumber);
    const u = await ids(p);
    for (const r of routes(t.id, t.partNumber, u.alex!)) {
      const a = await anon.req(r.m, r.path, { json: (r as any).json, csrf: false });
      ev.check(`401 ${r.m} ${r.path}`, a.status === 401 && !/partNumber|standardDiscount|oldPrice|userKind/.test(a.text), `HTTP ${a.status}`);
    }
    const pg = await anon.req('GET', '/sales/store');
    ev.check('/sales/store sends an anonymous visitor to sign in, with no page', (pg.status === 302 && /sign-in/.test(pg.headers.location ?? '')) || pg.status === 401, `HTTP ${pg.status} → ${pg.headers.location}`);
  }));

  it('TC-43', () => runCase('TC-43', 'who may read the refused attempts list', async (ev) => {
    for (const c of [sam, pat, morgan, lee, casey, riley]) {
      const a = await c.req('GET', '/api/sales/refused-attempts');
      ev.check(`${c.who} refused`, a.status === 403 && !/userKind/.test(a.text), `HTTP ${a.status}`);
    }
    const j = await jo.req('GET', '/api/sales/refused-attempts');
    ev.check('Jo (internal admin) answered', j.status === 200 && Array.isArray(j.json), `HTTP ${j.status}`);
  }));

  it('TC-44', () => runCase('TC-44', 'store page under other spellings, as a reseller', async (ev) => {
    const variants = ['/SALES/Store', '//sales/store', '/sales/%2e%2e/sales/store', '/sales%2Fstore', '/sales/store?x=1', '/%73ales/store', '/sales/./store', '/sales/store/', '/Sales', '/sales/store%00', '/sales/store;x'];
    for (const v of variants) {
      let a = await casey.req('GET', v);
      let chain = `HTTP ${a.status}`;
      for (let hop = 0; hop < 3 && a.status >= 300 && a.status < 400 && a.headers.location; hop++) {
        const loc = a.headers.location;
        a = await casey.req('GET', loc.startsWith('http') ? new URL(loc).pathname + new URL(loc).search : loc);
        chain += ` → ${loc} → HTTP ${a.status}`;
      }
      ev.check(`${v}: no application page, no server error`, a.status < 500 && !(a.status === 200 && /id="root"/.test(a.text)), chain);
    }
  }));

  it('TC-50', () => runCase('TC-50', 'T-13 — search text read as plain words', async (ev) => {
    for (const q of ['" OR 1=1 --', 'NEAR((a,b),5)', '*', '"', 'capacitor AND', '-', 'a'.repeat(2000), '%', "'; drop table product; --"]) {
      const a = await sam.req('GET', `/api/sales/store/products?q=${enc(q)}`);
      ev.check(`search ${JSON.stringify(q.length > 40 ? q.slice(0, 20) + `… (${q.length} chars)` : q)}`, a.status === 200 && Array.isArray(a.json), `HTTP ${a.status} ${a.text.slice(0, 120)}`);
    }
    ev.check('store intact after the searches', p.query<{ n: number }>('select count(*) n from product')[0]!.n > 1999);
  }));

  it('TC-49', () => runCase('TC-49', 'N-01 (partly) — search response on the loaded store', async (ev) => {
    const terms = ['capacitor', 'resistor', 'BWE-C0402', 'MOSFET', 'ceramic 10 nF', 'inductor', 'connector', 'SO-8', '0603', 'diode'];
    const times: number[] = []; let errors = 0;
    const one = async (i: number) => { const a = await sam.req('GET', `/api/sales/store/products?q=${enc(terms[i % terms.length]!)}`, { log: i < 10 }); times.push(a.ms); if (a.status !== 200) errors++; };
    const t0 = performance.now();
    for (let batch = 0; batch < 4; batch++) await Promise.all(Array.from({ length: 50 }, (_, k) => one(batch * 50 + k)));
    const wall = performance.now() - t0;
    const p95 = pct(times, 95);
    ev.note(`2,000 products; 200 searches in 4 waves of 50 concurrent; client-measured over loopback (≥ server time). p50 ${pct(times, 50).toFixed(1)} ms, p95 ${p95.toFixed(1)} ms, max ${Math.max(...times).toFixed(1)} ms, wall ${wall.toFixed(0)} ms.`);
    ev.check('no search failed', errors === 0, `${errors} errors`);
    ev.check('p95 ≤ 1.0 s at 2,000 products (the committed scale is 250,000 — see TC-49 note and TC-49B)', p95 <= 1000, `${p95.toFixed(1)} ms`);
    results['TC-49-measure'] = { pass: true, checks: 0, failed: [`p50=${pct(times, 50).toFixed(1)} p95=${p95.toFixed(1)} max=${Math.max(...times).toFixed(1)}`], at: new Date().toISOString() };
  }));

  it('TC-45', () => runCase('TC-45', 'N-07 — append-only records refuse update and delete', async (ev) => {
    const db = p.db(false);
    try {
      const tables = ['price_change', 'erp_load_run', 'erp_load_rejected_row', 'discount_change', 'refused_attempt'];
      const updatable = ['product', 'standard_discount', 'role_assignment', 'internal_user', 'reseller', 'reseller_user'];
      const history = ['product_history', 'role_assignment_history', 'standard_discount_history', 'internal_user_history', 'reseller_history', 'reseller_user_history'];
      const attempt = (sql: string) => { db.exec('BEGIN'); try { const r = db.prepare(sql).run(); return `ACCEPTED (${r.changes} row(s))`; } catch (e: any) { return `refused: ${e.message}`; } finally { db.exec('ROLLBACK'); } };
      const rows = (t: string) => (db.prepare(`select count(*) n from ${t}`).get() as { n: number }).n;
      const firstCol = (t: string) => (db.prepare(`pragma table_info(${t})`).all() as { name: string }[])[0]!.name;
      for (const t of tables) {
        const n = rows(t);
        if (!ev.check(`${t} holds rows to attempt against`, n > 0, `${n} rows`)) continue;
        const c = firstCol(t);
        const u = attempt(`update ${t} set ${c} = ${c} where rowid = (select min(rowid) from ${t})`);
        ev.check(`${t}: UPDATE refused`, u.startsWith('refused'), u);
        const d = attempt(`delete from ${t} where rowid = (select min(rowid) from ${t})`);
        ev.check(`${t}: DELETE refused`, d.startsWith('refused'), d);
      }
      for (const t of updatable) {
        const d = attempt(`delete from ${t} where rowid = (select min(rowid) from ${t})`);
        ev.check(`${t} (ledger, updatable): DELETE refused`, d.startsWith('refused') || rows(t) === 0, d);
      }
      for (const t of history) {
        let exists = true;
        try { rows(t); } catch { exists = false; }
        if (!exists) { ev.note(`${t}: no such table`); continue; }
        const n = rows(t);
        if (n === 0) { ev.note(`${t}: empty, nothing to attempt against`); continue; }
        const d = attempt(`delete from ${t} where rowid = (select min(rowid) from ${t})`);
        const c = firstCol(t);
        const u = attempt(`update ${t} set ${c} = ${c} where rowid = (select min(rowid) from ${t})`);
        ev.note(`${t} (the kept earlier versions of an updatable ledger, ${n} rows): DELETE ${d}; UPDATE ${u}`);
      }
      ev.note('Every attempt ran inside a transaction that was rolled back, so an accepted attempt changed nothing afterwards.');
    } finally { db.close(); }
  }));
});

// =====================================================================
// B — fresh stores, one per case where roles change
// =====================================================================
describe.sequential('B: fresh store, maintainer cases', () => {
  const p = new Portal('B-fresh');
  let pat: Client, sam: Client, jo: Client;
  beforeAll(async () => {
    await p.start();
    pat = await Client.as(p, 'Pat (rep, price maintainer)', staff('pat'));
    sam = await Client.as(p, 'Sam (rep, named for nothing)', staff('sam'));
    jo = await Client.as(p, 'Jo (internal admin)', staff('jo'));
  }, 60_000);
  afterAll(() => p.stop());
  const get = async (pn: string) => pat.req('GET', `/api/sales/store/part-numbers/${enc(pn)}`);

  it('TC-52', () => runCase('TC-52', 'load summary before any load', async (ev) => {
    const a = await pat.req('GET', '/api/sales/store/load-summary');
    ev.check('answered, not an error', a.status === 200, `HTTP ${a.status} ${a.text}`);
    ev.check('not reported complete', !(a.json?.summary?.complete === true), a.text);
    const page = await pat.req('GET', '/sales/store/load-summary');
    ev.check('the summary page is served', page.status === 200, `HTTP ${page.status}`);
  }));

  it('TC-41', () => runCase('TC-41', 'T-05 — a Bow account not on the internal users list', async (ev) => {
    const chris = await Client.as(p, 'Chris (Bow, not on the list)', staff('chris'));
    ev.check('sign-in refused', (chris as any).signInAnswer.status === 401, `HTTP ${(chris as any).signInAnswer.status} ${(chris as any).signInAnswer.text}`);
    ev.check('no session issued', chris.cookie === null);
    const a = await chris.req('GET', '/api/sales/store/load-summary');
    ev.check('no store access', a.status === 401, `HTTP ${a.status}`);
    const rec = (await jo.req('GET', '/api/sales/refused-attempts')).json.find((r: any) => /Chris/.test(r.user) || r.userKind === 'staff not listed');
    ev.check('refusal recorded', !!rec, rec ?? 'none');
  }));

  it('TC-06', () => runCase('TC-06', 'story-01-02 #1 — added product found by part number', async (ev) => {
    const a = await addProduct(pat, 'QA-ADD-0001', '4.25', 'QA resistor 4k7 0603');
    ev.check('save accepted', a.status >= 200 && a.status < 300, `HTTP ${a.status} ${a.text}`);
    const b = await get('QA-ADD-0001');
    ev.check('found by part number with the fields entered', b.status === 200 && b.json.partNumber === 'QA-ADD-0001' && b.json.description === 'QA resistor 4k7 0603' && b.json.priceText === '4.25', b.text);
    const s = await sam.req('GET', '/api/sales/store/products?q=QA-ADD-0001');
    ev.check('found by store search on the part number', s.status === 200 && s.json.some((x: any) => x.partNumber === 'QA-ADD-0001'), s.text.slice(0, 200));
  }));

  it('TC-07', () => runCase('TC-07', 'story-01-02 #2 — 10.00 → 12.00 adds one history line', async (ev) => {
    await addProduct(pat, 'QA-HIST-1012', '10.00');
    const t = (await get('QA-HIST-1012')).json;
    const h0 = (await pat.req('GET', `/api/sales/store/products/${t.id}/price-history`)).json;
    const before = new Date().toISOString();
    const a = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '12.00' } });
    const after = new Date().toISOString();
    ev.check('change accepted', a.status >= 200 && a.status < 300, `HTTP ${a.status}`);
    const h1 = (await pat.req('GET', `/api/sales/store/products/${t.id}/price-history`)).json;
    ev.check('exactly one line gained', h1.length === h0.length + 1, `${h0.length} → ${h1.length}`);
    const l = h1.at(-1);
    ev.check('old price 10.00', l.oldPrice === '10.00', l.oldPrice);
    ev.check('new price 12.00', l.newPrice === '12.00', l.newPrice);
    ev.check('who made the change: Pat', l.changedBy === 'Pat (rep)', l.changedBy);
    ev.check('date and time within the call', l.changedAt >= before.slice(0, 19) && l.changedAt <= after, `${before} ≤ ${l.changedAt} ≤ ${after}`);
    const raw = p.query('select * from price_change where product_id = ?', t.id);
    ev.check('database row holds old 100000, new 120000 ten-thousandths', (raw as any).at(-1).old_price === 100000 && (raw as any).at(-1).new_price === 120000, raw);
  }));

  it('TC-08', () => runCase('TC-08', 'story-01-02 #3 — three changes, three lines, oldest first', async (ev) => {
    await addProduct(pat, 'QA-HIST-3X', '1.00');
    const t = (await get('QA-HIST-3X')).json;
    for (const v of ['2.00', '3.00', '4.00']) await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: v } });
    const h = (await pat.req('GET', `/api/sales/store/products/${t.id}/price-history`)).json;
    ev.check('three lines', h.length === 3, h.length);
    ev.check('oldest first (by the order changes were made)', h.map((l: any) => l.newPrice).join(',') === '2.00,3.00,4.00', h.map((l: any) => `${l.oldPrice}→${l.newPrice}@${l.changedAt}`).join('; '));
    ev.check('times non-decreasing', h.every((l: any, i: number) => i === 0 || l.changedAt >= h[i - 1].changedAt));
  }));

  it('TC-29', () => runCase('TC-29', 'boundary — prices entered on add', async (ev) => {
    const cases: [string, boolean, number?][] = [['0', false], ['0.0001', true, 1], ['0.00001', false], ['-1', false], ['12,50', false], ['', false], ['1e3', false], ['900719925474.0991', true, 9007199254740991], ['900719925474.0992', false], [' 7.50 ', true, 75000]];
    let i = 0;
    for (const [price, ok, units] of cases) {
      const pn = `QA-PRICE-${++i}`;
      const a = await addProduct(pat, pn, price);
      ev.check(`price ${JSON.stringify(price)} ${ok ? 'accepted' : 'refused'}`, ok ? a.status >= 200 && a.status < 300 : a.status >= 400 && a.status < 500, `HTTP ${a.status} ${a.text.slice(0, 160)}`);
      if (ok) {
        const raw = p.query<{ price: number }>('select price from product where part_number = ?', pn)[0];
        ev.check(`price ${JSON.stringify(price)} held exactly`, raw?.price === units, raw);
      } else {
        ev.check(`price ${JSON.stringify(price)} left nothing in the store`, (await get(pn)).status === 404);
      }
    }
  }));

  it('TC-21', () => runCase('TC-21', 'boundary — part number length on add (63 / 64 / 65)', async (ev) => {
    for (const len of [63, 64, 65]) {
      const pn = ('QA-LEN-' + 'X'.repeat(80)).slice(0, len);
      const a = await addProduct(pat, pn);
      const ok = len <= 64;
      ev.check(`add ${len} characters ${ok ? 'accepted' : 'refused'}`, ok ? a.status >= 200 && a.status < 300 : a.status >= 400 && a.status < 500, `HTTP ${a.status} ${a.text.slice(0, 160)}`);
      if (ok) ev.check(`${len} characters found by lookup`, (await get(pn)).status === 200);
    }
  }));

  it('TC-30', () => runCase('TC-30', 'failure modes on add — duplicates, blank and long descriptions', async (ev) => {
    await addProduct(pat, 'QA-DUP-0001', '1.00');
    for (const pn of ['QA-DUP-0001', 'qa-dup-0001', ' QA-DUP-0001 ']) {
      const a = await addProduct(pat, pn, '2.00');
      ev.check(`add ${JSON.stringify(pn)} refused as a duplicate`, a.status >= 400 && a.status < 500, `HTTP ${a.status} ${a.text.slice(0, 160)}`);
    }
    ev.check('one QA-DUP-0001 in the store, still 1.00', p.query<{ n: number }>("select count(*) n from product where part_number = 'QA-DUP-0001' collate nocase or trim(part_number) = 'QA-DUP-0001'")[0]!.n === 1 && (await get('QA-DUP-0001')).json.priceText === '1.00');
    const blank = await addProduct(pat, 'QA-BLANK-DESC', '1.00', '   ');
    ev.check('blank description refused', blank.status >= 400 && blank.status < 500, `HTTP ${blank.status}`);
    const d500 = await addProduct(pat, 'QA-DESC-500', '1.00', 'D'.repeat(500));
    ev.check('500-character description accepted', d500.status >= 200 && d500.status < 300, `HTTP ${d500.status}`);
    const d501 = await addProduct(pat, 'QA-DESC-501', '1.00', 'D'.repeat(501));
    ev.check('501-character description refused', d501.status >= 400 && d501.status < 500, `HTTP ${d501.status}`);
    const nobody = await pat.req('POST', '/api/sales/store/products', { json: {} });
    ev.check('empty body refused with 4xx', nobody.status >= 400 && nobody.status < 500, `HTTP ${nobody.status}`);
    const wrong = await pat.req('POST', '/api/sales/store/products', { json: { partNumber: 12345, description: ['x'], price: 5 } });
    ev.check('wrong types refused with 4xx', wrong.status >= 400 && wrong.status < 500, `HTTP ${wrong.status}`);
  }));

  it('TC-31', () => runCase('TC-31', 'price change transitions — same, invalid, unknown and malformed product', async (ev) => {
    await addProduct(pat, 'QA-SAME-1000', '10.00');
    const t = (await get('QA-SAME-1000')).json;
    const same = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '10.00' } });
    ev.note(`same price: HTTP ${same.status} ${same.text.slice(0, 160)}`);
    const bad = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: 'abc' } });
    ev.check('invalid price refused 4xx', bad.status >= 400 && bad.status < 500, `HTTP ${bad.status}`);
    const h = (await pat.req('GET', `/api/sales/store/products/${t.id}/price-history`)).json;
    ev.check('no history line from a same or invalid price', h.length === 0, JSON.stringify(h));
    const unknown = await pat.req('POST', '/api/sales/store/products/999999/price', { json: { price: '1.00' } });
    ev.check('unknown product 404', unknown.status === 404, `HTTP ${unknown.status} ${unknown.text.slice(0, 120)}`);
    const malformed = await pat.req('POST', '/api/sales/store/products/x/price', { json: { price: '1.00' } });
    ev.check('malformed id 4xx', malformed.status >= 400 && malformed.status < 500, `HTTP ${malformed.status}`);
    const hUnknown = await pat.req('GET', '/api/sales/store/products/999999/price-history');
    ev.check('history of an unknown product: 404, not an empty list', hUnknown.status === 404, `HTTP ${hUnknown.status} ${hUnknown.text.slice(0, 120)}`);
    const pUnknown = await pat.req('GET', '/api/sales/store/products/999999');
    ev.check('unknown product read: 404', pUnknown.status === 404, `HTTP ${pUnknown.status}`);
    const big = await pat.req('GET', '/api/sales/store/products/99999999999999999999');
    ev.check('id beyond integer range: 4xx, not 5xx', big.status >= 400 && big.status < 500, `HTTP ${big.status}`);
  }));

  it('TC-32', () => runCase('TC-32', 'concurrency — 10 price changes on one product at once', async (ev) => {
    await addProduct(pat, 'QA-CONC-PRICE', '1.00');
    const t = (await get('QA-CONC-PRICE')).json;
    const answers = await Promise.all(Array.from({ length: 10 }, (_, i) => pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: `${i + 2}.00` } })));
    const accepted = answers.filter((a) => a.status >= 200 && a.status < 300).length;
    ev.note(`statuses: ${answers.map((a) => a.status).join(', ')}`);
    ev.check('no server error', answers.every((a) => a.status < 500));
    const h = (await pat.req('GET', `/api/sales/store/products/${t.id}/price-history`)).json;
    ev.check('one history line per accepted change', h.length === accepted, `${h.length} lines, ${accepted} accepted`);
    ev.check('each line’s old price is the previous line’s new price', h.every((l: any, i: number) => i === 0 ? l.oldPrice === '1.00' : l.oldPrice === h[i - 1].newPrice), h.map((l: any) => `${l.oldPrice}→${l.newPrice}`).join(', '));
    const now = (await get('QA-CONC-PRICE')).json;
    ev.check('final price is the last line’s new price', now.priceText === h.at(-1)?.newPrice, `${now.priceText} vs ${h.at(-1)?.newPrice}`);
  }));

  it('TC-33', () => runCase('TC-33', 'close transitions — twice, unknown', async (ev) => {
    await addProduct(pat, 'QA-CLOSE-2X');
    const t = (await get('QA-CLOSE-2X')).json;
    const a = await pat.req('POST', `/api/sales/store/products/${t.id}/close`);
    ev.check('first close accepted', a.status >= 200 && a.status < 300, `HTTP ${a.status}`);
    const b = await pat.req('POST', `/api/sales/store/products/${t.id}/close`);
    ev.check('second close refused 4xx', b.status >= 400 && b.status < 500, `HTTP ${b.status} ${b.text.slice(0, 160)}`);
    ev.check('still Closed', (await get('QA-CLOSE-2X')).json.status === 'Closed');
    const hist = p.query<{ n: number }>('select count(*) n from product_history where product_id = ?', t.id)[0]!.n;
    ev.check('one earlier version kept (the open state), not two', hist === 1, `${hist} product_history rows`);
    const u = await pat.req('POST', '/api/sales/store/products/999999/close');
    ev.check('unknown product 404', u.status === 404, `HTTP ${u.status}`);
  }));

  it('TC-42', () => runCase('TC-42', 'T-21 — anti-forgery token and cookie', async (ev) => {
    await addProduct(pat, 'QA-CSRF-1', '5.00');
    const t = (await get('QA-CSRF-1')).json;
    const none = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '6.00' }, csrf: false });
    ev.check('no token: refused', none.status === 403, `HTTP ${none.status}`);
    const wrong = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '6.00' }, csrf: 'not-the-token' });
    ev.check('wrong token: refused', wrong.status === 403, `HTTP ${wrong.status}`);
    const other = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '6.00' }, csrf: sam.csrf! });
    ev.check('another user’s token: refused', other.status === 403, `HTTP ${other.status}`);
    const form = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { headers: { 'content-type': 'application/x-www-form-urlencoded' }, csrf: false });
    ev.check('a plain form post (what a cross-site form sends): refused', form.status >= 400 && form.status < 500, `HTTP ${form.status}`);
    ev.check('price unchanged at 5.00', (await get('QA-CSRF-1')).json.priceText === '5.00');
    const s = await fetch(`${p.base}/dev/api/sign-in`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ audience: 'staff', subjectId: staff('pat') }) });
    const sc = s.headers.get('set-cookie') ?? '';
    ev.check('session cookie HttpOnly and SameSite=Strict', /HttpOnly/i.test(sc) && /SameSite=Strict/i.test(sc), sc.replace(/bow_session=[^;]+/, 'bow_session=<redacted>'));
    const ok = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '6.00' } });
    ev.check('with the right token: accepted (the refusals are not a broken route)', ok.status >= 200 && ok.status < 300, `HTTP ${ok.status}`);
  }));
});

describe.sequential('C: fresh stores, one per role case', () => {
  const portals: Portal[] = [];
  afterAll(() => portals.forEach((p) => p.stop()));
  async function fresh(name: string) {
    const p = new Portal(name); portals.push(p); await p.start();
    const who = async (s: string, label: string) => Client.as(p, label, staff(s));
    return { p, u: await ids(p), who };
  }

  it('TC-15', () => runCase('TC-15', 'story-01-05 #1 — named user can change a price', async (ev) => {
    const { p, u, who } = await fresh('C-15');
    const pat = await who('pat', 'Pat'); const sam = await who('sam', 'Sam (rep)'); const morgan = await who('morgan', 'Morgan (role manager)');
    await addProduct(pat, 'QA-NAME-1', '2.00');
    const t = (await pat.req('GET', '/api/sales/store/part-numbers/QA-NAME-1')).json;
    const before = await sam.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '3.00' } });
    ev.check('Sam refused before being named', before.status === 403, `HTTP ${before.status}`);
    const n = await morgan.req('POST', '/api/sales/named-users', { json: { internalUserId: u.sam, role: 'price maintainer' } });
    ev.check('Morgan names Sam', n.status >= 200 && n.status < 300, `HTTP ${n.status} ${n.text}`);
    const list = (await morgan.req('GET', '/api/sales/named-users')).json;
    ev.check('Sam recorded as named', list.users.find((x: any) => x.id === u.sam).roles.includes('price maintainer'));
    const after = await sam.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '3.00' } });
    ev.check('Sam (same session) changes the price', after.status >= 200 && after.status < 300, `HTTP ${after.status}`);
    ev.check('price is 3.00', (await pat.req('GET', '/api/sales/store/part-numbers/QA-NAME-1')).json.priceText === '3.00');
    void p;
  }));

  it('TC-16', () => runCase('TC-16', 'story-01-05 #2 — no longer named, refused', async (ev) => {
    const { u, who } = await fresh('C-16');
    const pat = await who('pat', 'Pat'); const morgan = await who('morgan', 'Morgan (role manager)');
    await addProduct(pat, 'QA-REVOKE-1', '2.00');
    const t = (await pat.req('GET', '/api/sales/store/part-numbers/QA-REVOKE-1')).json;
    ev.check('Pat changes a price while named', (await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '2.50' } })).status < 300);
    const r = await morgan.req('DELETE', `/api/sales/named-users/${u.pat}/${enc('price maintainer')}`);
    ev.check('Morgan removes Pat', r.status >= 200 && r.status < 300, `HTTP ${r.status} ${r.text}`);
    const h0 = (await pat.req('GET', `/api/sales/store/products/${t.id}/price-history`)).json.length;
    const a = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '9.00' } });
    ev.check('Pat (same session) refused', a.status === 403, `HTTP ${a.status} ${a.text}`);
    const t2 = (await pat.req('GET', '/api/sales/store/part-numbers/QA-REVOKE-1')).json;
    ev.check('price unchanged at 2.50', t2.priceText === '2.50', t2.priceText);
    ev.check('history unchanged', (await pat.req('GET', `/api/sales/store/products/${t.id}/price-history`)).json.length === h0);
  }));

  it('TC-17', () => runCase('TC-17', 'story-01-05 #3 — named discount setter sets a standard discount', async (ev) => {
    const { u, who } = await fresh('C-17');
    const alex = await who('alex', 'Alex (rep)'); const morgan = await who('morgan', 'Morgan (role manager)');
    const pre = await alex.req('POST', '/api/sales/resellers/1/standard-discount', { json: { percent: '12' } });
    ev.check('Alex refused before being named', pre.status === 403, `HTTP ${pre.status}`);
    const n = await morgan.req('POST', '/api/sales/named-users', { json: { internalUserId: u.alex, role: 'discount setter' } });
    ev.check('Morgan names Alex discount setter', n.status >= 200 && n.status < 300, `HTTP ${n.status}`);
    const a = await alex.req('POST', '/api/sales/resellers/1/standard-discount', { json: { percent: '12' } });
    ev.check('Alex sets Demo Reseller A to 12', a.status >= 200 && a.status < 300, `HTTP ${a.status} ${a.text}`);
    const r = (await alex.req('GET', '/api/sales/resellers')).json.find((x: any) => x.name === 'Demo Reseller A');
    ev.check('Demo Reseller A shows 12 %', r.standardDiscountText === '12 %' && r.standardDiscount === 1200, r);
    const h = (await alex.req('GET', '/api/sales/resellers/1/discount-history')).json;
    ev.check('one discount history line, none → 12 %, by Alex', h.length === 1 && /Alex/.test(JSON.stringify(h[0])), JSON.stringify(h));
  }));

  it('TC-18', () => runCase('TC-18', 'story-01-05 #4 — no longer named to set discounts, refused', async (ev) => {
    const { u, who } = await fresh('C-18');
    const lee = await who('lee', 'Lee (rep)'); const morgan = await who('morgan', 'Morgan (role manager)');
    const c0 = (await lee.req('GET', '/api/sales/resellers')).json.find((x: any) => x.name === 'Demo Reseller C');
    const r = await morgan.req('DELETE', `/api/sales/named-users/${u.lee}/${enc('discount setter')}`);
    ev.check('Morgan removes Lee', r.status >= 200 && r.status < 300, `HTTP ${r.status}`);
    const a = await lee.req('POST', `/api/sales/resellers/${c0.id}/standard-discount`, { json: { percent: '15' } });
    ev.check('Lee refused', a.status === 403, `HTTP ${a.status}`);
    const c1 = (await lee.req('GET', '/api/sales/resellers')).json.find((x: any) => x.name === 'Demo Reseller C');
    ev.check('C unchanged', c1.standardDiscount === c0.standardDiscount, `${c0.standardDiscountText} → ${c1.standardDiscountText}`);
  }));

  it('TC-19', () => runCase('TC-19', 'story-01-05 #5 — a rep named for neither changes who is named', async (ev) => {
    const { p, u, who } = await fresh('C-19');
    const sam = await who('sam', 'Sam (rep)');
    const before = JSON.stringify(p.query('select * from role_assignment order by internal_user_id, role'));
    const a = await sam.req('POST', '/api/sales/named-users', { json: { internalUserId: u.sam, role: 'price maintainer' } });
    ev.check('naming refused', a.status === 403, `HTTP ${a.status}`);
    const b = await sam.req('DELETE', `/api/sales/named-users/${u.pat}/${enc('price maintainer')}`);
    ev.check('removing refused', b.status === 403, `HTTP ${b.status}`);
    const c = await sam.req('POST', '/api/sales/named-users', { json: { internalUserId: u.alex, role: 'discount setter' } });
    ev.check('naming someone else refused', c.status === 403, `HTTP ${c.status}`);
    ev.check('lists unchanged', JSON.stringify(p.query('select * from role_assignment order by internal_user_id, role')) === before);
  }));

  it('TC-35', () => runCase('TC-35', 'cross-story: grant → revoke → grant', async (ev) => {
    const { p, u, who } = await fresh('C-35');
    const pat = await who('pat', 'Pat'); const morgan = await who('morgan', 'Morgan (role manager)');
    await addProduct(pat, 'QA-REGRANT-1', '2.00');
    const t = (await pat.req('GET', '/api/sales/store/part-numbers/QA-REGRANT-1')).json;
    await morgan.req('DELETE', `/api/sales/named-users/${u.pat}/${enc('price maintainer')}`);
    const n0 = p.query<{ n: number }>('select count(*) n from product')[0]!.n;
    ev.check('removed Pat refused add', (await addProduct(pat, 'QA-REGRANT-2')).status === 403);
    ev.check('removed Pat refused close', (await pat.req('POST', `/api/sales/store/products/${t.id}/close`)).status === 403);
    ev.check('removed Pat refused price', (await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '3.00' } })).status === 403);
    ev.check('removed Pat refused the load', (await pat.load(await workbook([['QA-R-1', 'x', 1]]))).status === 403);
    ev.check('store unchanged', p.query<{ n: number }>('select count(*) n from product')[0]!.n === n0 && (await pat.req('GET', `/api/sales/store/products/${t.id}`)).json.status === 'Open for quoting');
    const g = await morgan.req('POST', '/api/sales/named-users', { json: { internalUserId: u.pat, role: 'price maintainer' } });
    ev.check('Morgan names Pat again', g.status >= 200 && g.status < 300, `HTTP ${g.status} ${g.text}`);
    const c = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '3.00' } });
    ev.check('Pat changes the price again', c.status >= 200 && c.status < 300, `HTTP ${c.status}`);
    const hist = p.query('select * from role_assignment_history where internal_user_id = ? and role = ?', u.pat, 'price maintainer');
    ev.check('role history keeps the earlier grant and the revocation', hist.length >= 2, hist);
    ev.note(`role_assignment now: ${JSON.stringify(p.query('select * from role_assignment where internal_user_id = ?', u.pat))}`);
  }));

  it('TC-36', () => runCase('TC-36', 'naming and removing twice', async (ev) => {
    const { p, u, who } = await fresh('C-36');
    const morgan = await who('morgan', 'Morgan (role manager)');
    const a1 = await morgan.req('POST', '/api/sales/named-users', { json: { internalUserId: u.sam, role: 'price maintainer' } });
    const a2 = await morgan.req('POST', '/api/sales/named-users', { json: { internalUserId: u.sam, role: 'price maintainer' } });
    ev.check('first naming accepted', a1.status >= 200 && a1.status < 300, `HTTP ${a1.status}`);
    ev.check('second naming: no server error', a2.status < 500, `HTTP ${a2.status} ${a2.text}`);
    ev.check('one live assignment', p.query<{ n: number }>("select count(*) n from role_assignment where internal_user_id = ? and role = 'price maintainer' and revoked_at is null", u.sam)[0]!.n === 1);
    const r1 = await morgan.req('DELETE', `/api/sales/named-users/${u.sam}/${enc('price maintainer')}`);
    const r2 = await morgan.req('DELETE', `/api/sales/named-users/${u.sam}/${enc('price maintainer')}`);
    ev.check('first removal accepted', r1.status >= 200 && r1.status < 300, `HTTP ${r1.status}`);
    ev.check('second removal: no server error', r2.status < 500, `HTTP ${r2.status} ${r2.text}`);
    const never = await morgan.req('DELETE', `/api/sales/named-users/${u.alex}/${enc('discount setter')}`);
    ev.check('removing someone never named: no server error', never.status < 500, `HTTP ${never.status} ${never.text}`);
    const bogus = await morgan.req('DELETE', `/api/sales/named-users/${u.alex}/${enc('emperor')}`);
    ev.check('removing an unknown role: 4xx', bogus.status >= 400 && bogus.status < 500, `HTTP ${bogus.status}`);
    const list = (await morgan.req('GET', '/api/sales/named-users')).json;
    ev.check('list right afterwards: Sam named for nothing, Alex for nothing', list.users.find((x: any) => x.id === u.sam).roles.length === 0 && list.users.find((x: any) => x.id === u.alex).roles.length === 0, JSON.stringify(list.users));
  }));

  it('TC-37', () => runCase('TC-37', 'T-08 — nobody names themself; only nameable roles', async (ev) => {
    const { p, u, who } = await fresh('C-37');
    const jo = await who('jo', 'Jo (internal admin)'); const morgan = await who('morgan', 'Morgan (role manager)');
    const before = JSON.stringify(p.query('select * from role_assignment order by internal_user_id, role'));
    const j = await jo.req('POST', '/api/sales/named-users', { json: { internalUserId: u.jo, role: 'price maintainer' } });
    ev.check('Jo names self price maintainer: refused', j.status === 403, `HTTP ${j.status}`);
    const m = await morgan.req('POST', '/api/sales/named-users', { json: { internalUserId: u.morgan, role: 'discount setter' } });
    ev.check('Morgan names self discount setter: refused', m.status >= 400 && m.status < 500, `HTTP ${m.status} ${m.text}`);
    for (const role of ['internal admin', 'role manager']) {
      const a = await morgan.req('POST', '/api/sales/named-users', { json: { internalUserId: u.alex, role } });
      ev.check(`Morgan grants Alex "${role}" here: refused`, a.status >= 400 && a.status < 500, `HTTP ${a.status}`);
    }
    const x = await morgan.req('POST', '/api/sales/named-users', { json: { internalUserId: 999999, role: 'price maintainer' } });
    ev.check('unknown user: 4xx', x.status >= 400 && x.status < 500, `HTTP ${x.status} ${x.text}`);
    if (u.chris) {
      const c = await morgan.req('POST', '/api/sales/named-users', { json: { internalUserId: u.chris, role: 'price maintainer' } });
      ev.check('Chris (not on the internal users list): refused', c.status >= 400 && c.status < 500, `HTTP ${c.status}`);
    } else ev.note('Chris has no internal_user row, so he cannot be addressed by id.');
    const selfRemove = await morgan.req('DELETE', `/api/sales/named-users/${u.morgan}/${enc('role manager')}`);
    ev.check('Morgan removes own role manager role through this route: 4xx', selfRemove.status >= 400 && selfRemove.status < 500, `HTTP ${selfRemove.status}`);
    ev.check('lists unchanged', JSON.stringify(p.query('select * from role_assignment order by internal_user_id, role')) === before);
  }));

  it('TC-46', () => runCase('TC-46', 'N-09 — role removal takes effect on the next action', async (ev) => {
    const { u, who } = await fresh('C-46');
    const pat = await who('pat', 'Pat'); const lee = await who('lee', 'Lee'); const morgan = await who('morgan', 'Morgan (role manager)');
    await addProduct(pat, 'QA-N09', '2.00');
    const t = (await pat.req('GET', '/api/sales/store/part-numbers/QA-N09')).json;
    ev.check('both roles work before removal', (await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '2.10' } })).status < 300 && (await lee.req('POST', '/api/sales/resellers/3/standard-discount', { json: { percent: '11' } })).status < 300);
    await morgan.req('DELETE', `/api/sales/named-users/${u.pat}/${enc('price maintainer')}`);
    await morgan.req('DELETE', `/api/sales/named-users/${u.lee}/${enc('discount setter')}`);
    const a = await pat.req('POST', `/api/sales/store/products/${t.id}/price`, { json: { price: '2.20' } });
    const b = await lee.req('POST', '/api/sales/resellers/3/standard-discount', { json: { percent: '12' } });
    ev.check('Pat’s next price change refused, no grace', a.status === 403, `HTTP ${a.status}`);
    ev.check('Lee’s next discount change refused, no grace', b.status === 403, `HTTP ${b.status}`);
    const c = (await lee.req('GET', '/api/sales/resellers')).json.find((x: any) => x.id === 3);
    ev.check('values unchanged (2.10, 11 %)', (await pat.req('GET', `/api/sales/store/products/${t.id}`)).json.priceText === '2.10' && c.standardDiscountText === '11 %', c);
  }));

  it('TC-51', () => runCase('TC-51', 'boundary — standard discount values', async (ev) => {
    const { who } = await fresh('C-51');
    const lee = await who('lee', 'Lee (rep, discount setter)');
    const seq: [string, boolean, number?][] = [['-1', false], ['0', true, 0], ['100', true, 10000], ['100.01', false], ['12.5', true, 1250], ['12.555', false], ['', false], ['12 %', true, 1200], ['1e1', false], ['101', false]];
    let accepted = 0; let last: number | null = null;
    for (const [v, ok, h] of seq) {
      const a = await lee.req('POST', '/api/sales/resellers/1/standard-discount', { json: { percent: v } });
      ev.check(`${JSON.stringify(v)} ${ok ? 'accepted' : 'refused'}`, ok ? a.status >= 200 && a.status < 300 : a.status >= 400 && a.status < 500, `HTTP ${a.status} ${a.text.slice(0, 140)}`);
      const r = (await lee.req('GET', '/api/sales/resellers')).json.find((x: any) => x.id === 1);
      if (ok && a.status < 300) { accepted++; last = h!; }
      ev.check(`value after ${JSON.stringify(v)}`, r.standardDiscount === last, `${r.standardDiscount} (expected ${last})`);
    }
    const hist = (await lee.req('GET', '/api/sales/resellers/1/discount-history')).json;
    ev.check('one history line per accepted change', hist.length === accepted, `${hist.length} lines, ${accepted} accepted`);
  }));
});

// =====================================================================
// D — the load, on its own fresh store per case
// =====================================================================
describe.sequential('D: the ERP load, hand-built workbooks', () => {
  const portals: Portal[] = [];
  afterAll(() => portals.forEach((p) => p.stop()));
  async function fresh(name: string) {
    const p = new Portal(name); portals.push(p); await p.start();
    return { p, pat: await Client.as(p, 'Pat (rep, price maintainer)', staff('pat')) };
  }
  const summaryOf = (a: any) => a.json?.summary;
  const listed = (s: any, pn: string) => s.notLoaded.filter((r: any) => r.partNumber === pn);
  const stored = (p: Portal, pn: string) => p.query<{ part_number: string; description: string; price: number }>('select part_number, description, price from product where part_number = ?', pn)[0];
  let p20: Portal; let pat20: Client; let tc28xml: Record<string, string> = {};

  it('TC-20', () => runCase('TC-20', 'boundary — prices in the load', async (ev) => {
    ({ p: p20, pat: pat20 } = await fresh('D-20'));
    const rows: CellValue[][] = [
      ['QA-P-0N', 'zero, number cell', 0], ['QA-P-0T', 'zero, text cell', '0'],
      ['QA-P-MINN', 'smallest, number', 0.0001], ['QA-P-MINT', 'smallest, text', '0.0001'],
      ['QA-P-5DN', 'five places, number', 0.00015], ['QA-P-5DT', 'five places, text', '0.00015'],
      ['QA-P-MAXN', 'largest exact, number', 900719925474.0991], ['QA-P-MAXT', 'largest exact, text', '900719925474.0991'],
      ['QA-P-OVN', 'above largest, number', 900719925474.0992], ['QA-P-OVT', 'above largest, text', '900719925474.0992'],
      ['QA-P-OK', 'ordinary', 12.5],
    ];
    const a = await pat20.load(await workbook(rows));
    const s = summaryOf(a);
    ev.check('load answered', a.status < 300, `HTTP ${a.status} ${a.text.slice(0, 200)}`);
    ev.check('identity: loaded + not loaded = 11', s.rowsInErp === 11 && s.rowsLoaded + s.rowsNotLoaded === 11, `${s.rowsInErp}: ${s.rowsLoaded} + ${s.rowsNotLoaded}`);
    const expectRefused = ['QA-P-0N', 'QA-P-0T', 'QA-P-5DN', 'QA-P-5DT', 'QA-P-OVT'];
    for (const pn of expectRefused) ev.check(`${pn} listed with a reason, not stored`, listed(s, pn).length === 1 && !stored(p20, pn), listed(s, pn)[0] ?? stored(p20, pn));
    for (const [pn, units] of [['QA-P-MINN', 1], ['QA-P-MINT', 1], ['QA-P-MAXT', 9007199254740991], ['QA-P-OK', 125000]] as const) {
      ev.check(`${pn} stored exactly (${units})`, stored(p20, pn)?.price === units, stored(p20, pn) ?? listed(s, pn)[0]);
    }
    for (const [pn, v] of [['QA-P-MAXN', 900719925474.0991], ['QA-P-OVN', 900719925474.0992]] as const) {
      const st = stored(p20, pn); const ls = listed(s, pn)[0];
      const shown = String(v); // what a spreadsheet cell holding this double reads back as
      ev.check(`${pn}: listed, or stored as exactly the value the cell holds (${shown})`, !!ls || st?.price === priceUnits(shown), st ? `stored ${st.price}` : ls);
      ev.note(`${pn} (a number cell, ${shown}): ${st ? `stored ${st.price}` : `listed: ${ls?.reason}`}`);
    }
  }, () => ({})));

  it('TC-53', () => runCase('TC-53', 'four-place prices read back without losing places', async (ev) => {
    const a = await pat20.req('GET', '/api/sales/store/part-numbers/QA-P-MINT');
    ev.check('0.0001 reads back as 0.0001', a.json?.priceText === '0.0001', a.text);
    await addProduct(pat20, 'QA-FOURPLACE', '0.0040');
    const b = await pat20.req('GET', '/api/sales/store/part-numbers/QA-FOURPLACE');
    ev.check('0.0040 reads back as 0.0040', b.json?.priceText === '0.0040', b.text);
    const c = await pat20.req('GET', '/api/sales/store/part-numbers/QA-P-MAXT');
    ev.check('largest price reads back as 900719925474.0991', c.json?.priceText === '900719925474.0991', c.text);
  }));

  it('TC-21-load', () => runCase('TC-21/load', 'boundary — part number length in the load (63 / 64 / 65)', async (ev) => {
    // The add half ran in group B and wrote its own evidence; this half appends the load.
    const { p, pat } = await fresh('D-21');
    const pns = [63, 64, 65].map((n) => ('QA-LEN-' + 'Y'.repeat(80)).slice(0, n));
    const a = await pat.load(await workbook(pns.map((pn) => [pn, 'length probe', 1])));
    const s = summaryOf(a);
    ev.check('63 loaded', !!stored(p, pns[0]!));
    ev.check('64 loaded', !!stored(p, pns[1]!));
    ev.check('65 listed with a reason, not stored', listed(s, pns[2]!).length === 1 && !stored(p, pns[2]!), listed(s, pns[2]!)[0]);
    ev.check('identity 3', s.rowsLoaded + s.rowsNotLoaded === 3);
  }));

  it('TC-22', () => runCase('TC-22', 'T-14 — bad values in the load', async (ev) => {
    const { p, pat } = await fresh('D-22');
    const rows: CellValue[][] = [
      ['QA-G-1', 'good one', 1.5],
      ['QA-B-COMMA', 'comma', '1,234.50'], ['QA-B-DOLLAR', 'dollar', '$12'], ['QA-B-REF', 'error cell', { error: '#REF!' }],
      ['QA-B-FORMULA', 'formula', { formula: '1+1' }], ['QA-B-BLANK', 'blank price', null], ['QA-B-NEG', 'negative', -5],
      ['', 'no part number', 3.5], ['   ', 'spaces-only part number', 3.5], ['QA-B-NEGT', 'negative text', '-5'],
      ['QA-B-TEXTNUM', 'text with spaces', ' 12.50 '], ['QA-B-WORD', 'a word', 'TBA'], ['QA-B-NA', 'N/A error', { error: '#N/A' }],
      ['QA-G-2', 'good two', '2.25'],
    ];
    const a = await pat.load(await workbook(rows));
    const s = summaryOf(a);
    ev.check('load answered', a.status < 300, `HTTP ${a.status} ${a.text.slice(0, 200)}`);
    ev.check('identity: loaded + not loaded = 14', s.rowsInErp === 14 && s.rowsLoaded + s.rowsNotLoaded === 14, `${s.rowsInErp}: ${s.rowsLoaded} + ${s.rowsNotLoaded}`);
    for (const pn of ['QA-B-COMMA', 'QA-B-DOLLAR', 'QA-B-REF', 'QA-B-FORMULA', 'QA-B-BLANK', 'QA-B-NEG', 'QA-B-NEGT', 'QA-B-WORD', 'QA-B-NA']) {
      ev.check(`${pn} listed with a reason, not stored`, listed(s, pn).length === 1 && !!listed(s, pn)[0].reason && !stored(p, pn), listed(s, pn)[0] ?? stored(p, pn));
    }
    const blanks = s.notLoaded.filter((r: any) => r.partNumber.trim() === '');
    ev.check('both rows without a part number listed', blanks.length === 2, blanks);
    ev.check('good rows stored', stored(p, 'QA-G-1')?.price === 15000 && stored(p, 'QA-G-2')?.price === 22500);
    ev.note(`' 12.50 ' as text: ${stored(p, 'QA-B-TEXTNUM') ? `stored ${stored(p, 'QA-B-TEXTNUM')!.price}` : `listed: ${listed(s, 'QA-B-TEXTNUM')[0]?.reason}`}`);
    ev.check('not complete', s.complete === false && /not complete/i.test(s.statusText), s.statusText);
    ev.check('store holds exactly the loaded count', p.query<{ n: number }>('select count(*) n from product')[0]!.n === s.rowsLoaded);
  }, () => ({})));

  it('TC-23', () => runCase('TC-23', 'duplicates in the load', async (ev) => {
    const { p, pat } = await fresh('D-23');
    const rows: CellValue[][] = [
      ['QA-D1', 'same price a', 1], ['QA-D1', 'same price b', 1],
      ['QA-D2', 'case a', 2], ['qa-d2', 'case b', 2.5],
      ['QA-D3', 'spaces a', 3], [' QA-D3 ', 'spaces b', 3.5],
      ['QA-D4', 'triple 1', 4], ['QA-D4', 'triple 2', 4.1], ['QA-D4', 'triple 3', 4.2],
      ['QA-OK', 'unique', 9],
    ];
    const s = summaryOf(await pat.load(await workbook(rows)));
    ev.check('identity: loaded + not loaded = 10', s.rowsLoaded + s.rowsNotLoaded === 10 && s.rowsInErp === 10, `${s.rowsInErp}: ${s.rowsLoaded} + ${s.rowsNotLoaded}`);
    const dupRows = s.notLoaded.filter((r: any) => r.reason === 'duplicate part number');
    ev.check('all nine duplicate rows listed "duplicate part number"', dupRows.length === 9, s.notLoaded.map((r: any) => `${r.rowNumber} ${JSON.stringify(r.partNumber)} ${r.reason}`).join('; '));
    for (const pn of ['QA-D1', 'QA-D2', 'QA-D3', 'QA-D4']) ev.check(`${pn} not in the store (any case)`, p.query<{ n: number }>('select count(*) n from product where trim(part_number) = ? collate nocase', pn)[0]!.n === 0);
    ev.check('the unique row stored', !!stored(p, 'QA-OK'));
  }));

  it('TC-25', () => runCase('TC-25', 'boundary — an ERP of zero rows and of one row', async (ev) => {
    const z = await fresh('D-25-zero');
    const a = await z.pat.load(await workbook([]));
    ev.note(`heading-only workbook: HTTP ${a.status} ${a.text.slice(0, 400)}`);
    const s0 = summaryOf(a);
    if (s0) {
      ev.check('N = 0: identity holds', s0.rowsInErp === 0 && s0.rowsLoaded + s0.rowsNotLoaded === 0, s0);
      ev.note(`N = 0 reported complete: ${s0.complete} — "${s0.statusText}"`);
      const again = await z.pat.load(readFileSync(SAMPLE), 'sample-erp.xlsx');
      ev.note(`after an empty load, the real load: HTTP ${again.status} ${again.text.slice(0, 200)}`);
      ev.check('an empty load does not block the real load (the store is still empty)', again.status < 300, `HTTP ${again.status}`);
    } else {
      ev.check('heading-only workbook refused with a message (4xx)', a.status >= 400 && a.status < 500, `HTTP ${a.status}`);
    }
    const o = await fresh('D-25-one');
    const s1 = summaryOf(await o.pat.load(await workbook([['QA-ONE', 'only row', 1]])));
    ev.check('N = 1: loaded, identity holds, complete', s1.rowsInErp === 1 && s1.rowsLoaded === 1 && s1.complete === true && /^Load complete/.test(s1.statusText), s1);
  }));

  it('TC-26', () => runCase('TC-26', 'malformed load requests', async (ev) => {
    const { p, pat } = await fresh('D-26');
    const f = new FormData(); f.append('note', 'no file here');
    const none = await pat.req('POST', '/api/sales/store/load', { form: f });
    ev.check('no file: 4xx', none.status >= 400 && none.status < 500, `HTTP ${none.status} ${none.text.slice(0, 160)}`);
    const nobody = await pat.req('POST', '/api/sales/store/load', { json: {} });
    ev.check('not multipart at all: 4xx', nobody.status >= 400 && nobody.status < 500, `HTTP ${nobody.status} ${nobody.text.slice(0, 160)}`);
    const txt = await pat.load(Buffer.from('Part number,Description,Price\nX,Y,1\n'), 'erp.xlsx');
    ev.check('a text file named .xlsx: 4xx', txt.status >= 400 && txt.status < 500, `HTTP ${txt.status} ${txt.text.slice(0, 160)}`);
    const noPrice = await pat.load(await workbook([['QA-NP', 'x']], ['Part number', 'Description']));
    ev.check('no Price column: 4xx', noPrice.status >= 400 && noPrice.status < 500, `HTTP ${noPrice.status} ${noPrice.text.slice(0, 160)}`);
    const big = await pat.load(Buffer.alloc(26 * 1024 * 1024, 0x41), 'big.xlsx');
    ev.check('a 26 MB file (over the 25 MB limit): 4xx, not 5xx', big.status >= 400 && big.status < 500, `HTTP ${big.status} ${big.text.slice(0, 160)}`);
    ev.check('store still empty', p.query<{ n: number }>('select count(*) n from product')[0]!.n === 0);
    ev.note(`erp_load_run rows after the refusals: ${p.query<{ n: number }>('select count(*) n from erp_load_run')[0]!.n}`);
    const ok = await pat.load(readFileSync(SAMPLE), 'sample-erp.xlsx');
    ev.check('the real load still possible afterwards', ok.status < 300 && summaryOf(ok).rowsLoaded === 2000, `HTTP ${ok.status}`);
  }));

  it('TC-27', () => runCase('TC-27', 'concurrency — five loads at once on an empty store', async (ev) => {
    const { p, pat } = await fresh('D-27');
    const file = readFileSync(SAMPLE);
    const answers = await Promise.all(Array.from({ length: 5 }, () => pat.load(file, 'sample-erp.xlsx')));
    const ok = answers.filter((a) => a.status >= 200 && a.status < 300).length;
    ev.note(`statuses: ${answers.map((a) => a.status).join(', ')}`);
    ev.check('exactly one load accepted', ok === 1, `${ok} accepted`);
    ev.check('no server error', answers.every((a) => a.status < 500));
    ev.check('store holds exactly one load’s products (2000)', p.query<{ n: number }>('select count(*) n from product')[0]!.n === 2000, p.query('select count(*) n from product'));
    ev.check('one load run recorded as loaded', p.query<{ n: number }>('select count(*) n from erp_load_run')[0]!.n === 1, p.query('select load_run_id, rows_loaded from erp_load_run'));
  }));

  it('TC-28', () => runCase('TC-28', 'raw bytes — text the ERP holds, compared with the database', async (ev) => {
    const { p, pat } = await fresh('D-28');
    const rows: CellValue[][] = [
      ['QA-R1', 'Line one\nLine two', 1], ['QA-R2', '  padded  ', 1], ['QA-R3', 'Capacitor 10 µF ±10 % 1 kΩ', 1],
      ['QA-R4 ', 'part number with a trailing space', 1], ['QA-R5', 'CRLF a\r\nb', 1], ['QA-R6', 'tab\there', 1],
    ];
    const buf = await workbook(rows);
    // What the workbook itself holds, read back independently (cell values and the raw sheet XML).
    const ExcelJS = (await import('exceljs')).default;
    const JSZip = (await import('jszip')).default;
    const back = new ExcelJS.Workbook(); await back.xlsx.load(buf);
    const held: string[] = [];
    const heldRows: [string, string][] = [];
    back.worksheets[0]!.eachRow((r, n) => { if (n > 1) { held.push(JSON.stringify([r.getCell(1).value, r.getCell(2).value])); heldRows.push([String(r.getCell(1).value), String(r.getCell(2).value)]); } });
    ev.note(`the workbook holds, read back: ${held.join(' ')}`);
    const zip = await JSZip.loadAsync(buf);
    const xmlFiles = Object.keys(zip.files).filter((f) => /sharedStrings|worksheets\/sheet1/.test(f));
    const xml: Record<string, string> = {};
    for (const f of xmlFiles) xml[f] = await zip.file(f)!.async('string');
    const s = summaryOf(await pat.load(buf));
    // Compared with what the workbook holds as read back (not with what this script asked exceljs to write):
    // exceljs itself writes a typed CRLF as LF, so QA-R5 is compared with LF.
    for (const [pn, desc] of heldRows) {
      const st = p.query<{ part_number: string; description: string }>('select part_number, description from product where trim(part_number) = ?', pn.trim())[0];
      const ls = s.notLoaded.find((r: any) => r.partNumber.trim() === pn.trim());
      const same = st && st.part_number === pn && st.description === desc;
      ev.check(`${JSON.stringify(pn)} / ${JSON.stringify(desc)}: stored byte-for-byte or listed`, !!same || !!ls,
        st ? `stored part ${JSON.stringify(st.part_number)} description ${JSON.stringify(st.description)}` : `listed: ${ls?.reason}`);
    }
    tc28xml = xml;
  }, () => ({ 'workbook-xml.json': tc28xml })));

  it('TC-54', () => runCase('TC-54', 'cross-story: a product added before the ERP load', async (ev) => {
    const { p, pat } = await fresh('D-54');
    const erp = await readErp(SAMPLE);
    const a = await addProduct(pat, 'QA-EARLY-ADD', '1.00');
    ev.check('a maintainer can add a product to the empty store before any load', a.status >= 200 && a.status < 300, `HTTP ${a.status}`);
    const l = await pat.load(readFileSync(SAMPLE), 'sample-erp.xlsx');
    ev.note(`the go-live load after one early add: HTTP ${l.status} ${l.text.slice(0, 300)}`);
    ev.check('the load answers without a server error', l.status < 500, `HTTP ${l.status}`);
    const n = p.query<{ n: number }>('select count(*) n from product')[0]!.n;
    const del = (() => { const db = p.db(false); try { db.prepare("delete from product where part_number = 'QA-EARLY-ADD'").run(); return 'deleted'; } catch (e: any) { return `refused: ${e.message}`; } finally { db.close(); } })();
    ev.note(`store after the load attempt: ${n} product(s). ERP rows: ${erp.rows.length}. Removing the early product with the application's own database identity: ${del}. No screen or route removes a product.`);
    ev.check('the ERP was loaded, or the load was refused with a reason a maintainer can act on', l.status < 300 || /product/i.test(l.text), l.text.slice(0, 200));
  }));

  it('TC-55', () => runCase('TC-55', 'concurrency: adds racing the ERP load on an empty store', async (ev) => {
    const { p, pat } = await fresh('D-55');
    const erp = await readErp(SAMPLE);
    const collide = erp.rows.slice(1500, 1505).map((r) => r.partNumber);
    // The load goes first; the adds follow at staggered delays so some land while the load is in flight.
    // First run (5–1500 ms) showed the load answering ~190 ms after it was sent, with the early adds landing before its
    // empty-store check. These delays put every add inside or just after the load's own window instead.
    const delays = [110, 140, 160, 175, 185, 195, 210, 260];
    const t0 = performance.now();
    const loading = pat.load(readFileSync(SAMPLE), 'sample-erp.xlsx').then((a) => { ev.note(`load answered after ${(performance.now() - t0).toFixed(0)} ms`); return a; });
    const addAt = (ms: number, pn: string, desc: string) => new Promise<Awaited<ReturnType<typeof addProduct>>>((res) => setTimeout(async () => { const a = await addProduct(pat, pn, '999.99', desc); ev.note(`add ${pn} sent at ${ms} ms → HTTP ${a.status} after ${(performance.now() - t0).toFixed(0)} ms`); res(a); }, ms));
    const [load, ...adds] = await Promise.all([
      loading,
      ...delays.slice(0, 5).map((ms, i) => addAt(ms, collide[i]!, 'racing add with an ERP part number')),
      ...delays.slice(5).map((ms, i) => addAt(ms, `QA-RACE-${i + 1}`, 'racing add, new part number')),
    ]);
    ev.note(`load HTTP ${load.status}; adds ${adds.map((a) => a.status).join(', ')}`);
    ev.check('no server error', load.status < 500 && adds.every((a) => a.status < 500), `load ${load.status}; adds ${adds.map((a) => a.status)}`);
    const n = p.query<{ n: number }>('select count(*) n from product')[0]!.n;
    const addsOk = adds.filter((a) => a.status < 300).length;
    const loaded = load.status < 300 ? load.json.summary.rowsLoaded : 0;
    ev.check('store count = products loaded + adds accepted', n === loaded + addsOk, `${n} in store; ${loaded} loaded + ${addsOk} added`);
    const wrong = collide.map((pn) => p.query<{ price: number; description: string }>('select price, description from product where part_number = ?', pn)[0]).filter((r) => r && r.description.startsWith('racing add'));
    ev.check('no ERP part number holds a racing add’s price while the summary counts it as loaded', !(loaded > 0 && wrong.length > 0), wrong);
  }));
});

// =====================================================================
// E — N-01 at the committed catalog size, on its own store
// =====================================================================
describe.sequential('E: 250,000 products', () => {
  const p = new Portal('E-250k');
  afterAll(() => p.stop());
  it('TC-49B', () => runCase('TC-49B', 'N-01 — search response at 250,000 products (local)', async (ev) => {
    await p.start();
    const pat = await Client.as(p, 'Pat', staff('pat'));
    const sam = await Client.as(p, 'Sam', staff('sam'));
    const kinds = ['Capacitor, ceramic', 'Resistor, thick film', 'MOSFET, N-channel', 'Inductor, power', 'Connector, header', 'Diode, Schottky'];
    const rows: CellValue[][] = Array.from({ length: 250_000 }, (_, i) => [`QA-SCALE-${String(i).padStart(6, '0')}`, `${kinds[i % kinds.length]} ${i % 97} ${['0402', '0603', 'SO-8', 'SOT-23'][i % 4]}`, `${(i % 5000) + 1}.${String(i % 100).padStart(2, '0')}`]);
    const buf = await workbook(rows);
    ev.note(`workbook ${(buf.length / 1024 / 1024).toFixed(1)} MB`);
    const t0 = performance.now();
    const a = await pat.load(buf, 'scale.xlsx');
    const loadMs = performance.now() - t0;
    ev.note(`load: HTTP ${a.status} in ${(loadMs / 1000).toFixed(1)} s; ${a.text.slice(0, 200)}`);
    ev.check('250,000 rows loaded', a.status < 300 && a.json?.summary?.rowsLoaded === 250_000, `HTTP ${a.status}`);
    const terms = ['capacitor', 'resistor', 'QA-SCALE-12345', 'MOSFET', 'ceramic 0402', 'inductor', 'connector', 'SO-8', 'Schottky', 'thick film'];
    const times: number[] = []; let errors = 0;
    for (let batch = 0; batch < 4; batch++) {
      await Promise.all(Array.from({ length: 50 }, async (_, k) => { const i = batch * 50 + k; const r = await sam.req('GET', `/api/sales/store/products?q=${enc(terms[i % terms.length]!)}`, { log: i < 10 }); times.push(r.ms); if (r.status !== 200) errors++; }));
    }
    const p95 = pct(times, 95);
    // The same terms one at a time, to separate the cost of one search from queueing behind 49 others.
    const single: string[] = [];
    for (const term of terms) {
      const runs: number[] = [];
      let size = 0;
      for (let k = 0; k < 5; k++) { const r = await sam.req('GET', `/api/sales/store/products?q=${enc(term)}`, { log: false }); runs.push(r.ms); size = Array.isArray(r.json) ? r.json.length : -1; }
      single.push(`${JSON.stringify(term)} median ${pct(runs, 50).toFixed(0)} ms (${size} results)`);
    }
    ev.note(`one search at a time, 5 runs each: ${single.join('; ')}`);
    ev.note(`200 searches, 4 waves of 50 concurrent, client-measured over loopback: p50 ${pct(times, 50).toFixed(0)} ms, p95 ${p95.toFixed(0)} ms, max ${Math.max(...times).toFixed(0)} ms`);
    ev.check('no search failed', errors === 0, errors);
    ev.check('p95 ≤ 1.0 s (N-01), measured locally on SQLite, not the committed Azure tier', p95 <= 1000, `${p95.toFixed(0)} ms`);
    results['TC-49B-measure'] = { pass: true, checks: 0, failed: [`load=${(loadMs / 1000).toFixed(1)}s p50=${pct(times, 50).toFixed(0)} p95=${p95.toFixed(0)} max=${Math.max(...times).toFixed(0)}`], at: new Date().toISOString() };
  }), 900_000);
});
